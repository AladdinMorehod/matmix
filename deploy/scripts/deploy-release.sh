#!/usr/bin/env bash
set -Eeuo pipefail

SERVICE="matmix"
RUNTIME_USER="matmix"
RUNTIME_GROUP="matmix"
REPO="/home/deploy/apps/matmix"
RELEASES_ROOT="/opt/matmix/releases"
APP_LINK="/opt/matmix/app"
ENV_FILE="/etc/matmix/matmix.env"
BUILD_ROOT="/var/tmp/matmix-build"
DEPLOY_LOCK="/run/lock/matmix-deploy.lock"
HEALTH_URLS=(
  "http://127.0.0.1:3000/health"
  "http://127.0.0.1:3000/health/ready"
  "http://127.0.0.1:3000/ready"
  "http://127.0.0.1:3000/"
  "http://127.0.0.1:3000/catalog"
  "http://127.0.0.1:3000/login.html"
)

usage() {
  echo "Usage: sudo $0 <git-commit>"
  echo "Example: sudo $0 1f14019"
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

require_root() {
  [[ "${EUID}" -eq 0 ]] || fail "Run this script with sudo."
}

health_check() {
  local url
  for url in "${HEALTH_URLS[@]}"; do
    curl --fail --silent --show-error --max-time 10 "$url" >/dev/null
  done
}

atomic_switch() {
  local target="$1"
  local tmp_link="${APP_LINK}.next.$$"
  ln -s "$target" "$tmp_link"
  mv -Tf "$tmp_link" "$APP_LINK"
}

remove_build_directory() {
  local target="$1"
  [[ -n "$target" && "$target" == "$BUILD_ROOT/"* && "$target" != "$BUILD_ROOT" ]] \
    || fail "Refusing to remove an unsafe build directory."
  rm -rf -- "$target"
}

load_production_environment() {
  [[ -r "$ENV_FILE" ]] || fail "Environment file is unavailable: $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
}

run_in_release() {
  local release="$1"
  shift
  (
    cd "$release"
    runuser -u "$RUNTIME_USER" --preserve-environment -- "$@"
  )
}

validate_runtime_configuration() {
  local release="$1"

  run_in_release "$release" node -e \
    "require('./backend/services/productionReadiness').assertProductionEnvironment(process.env)"

  [[ -n "${MATMIX_DB_PATH:-}" && -f "$MATMIX_DB_PATH" ]] \
    || fail "MATMIX_DB_PATH must identify the existing production database."
  [[ -n "${SESSION_DB_PATH:-}" ]] || fail "SESSION_DB_PATH is required."
  [[ -n "${PRODUCT_UPLOADS_PATH:-}" && -d "$PRODUCT_UPLOADS_PATH" ]] \
    || fail "PRODUCT_UPLOADS_PATH must identify the existing product upload directory."
  [[ -n "${ORDER_ATTACHMENTS_PATH:-}" ]] || fail "ORDER_ATTACHMENTS_PATH is required."
  [[ -n "${CATALOG_IMPORT_ARCHIVE_PATH:-}" ]] || fail "CATALOG_IMPORT_ARCHIVE_PATH is required."
  [[ -n "${BACKUP_ROOT_PATH:-}" && -d "$BACKUP_ROOT_PATH" ]] \
    || fail "BACKUP_ROOT_PATH must identify the existing backup directory."
  [[ -n "${APP_RUNTIME_LOCK_PATH:-}" ]] || fail "APP_RUNTIME_LOCK_PATH is required."

  install -d -o "$RUNTIME_USER" -g "$RUNTIME_GROUP" -m 0750 "$ORDER_ATTACHMENTS_PATH"
  install -d -o "$RUNTIME_USER" -g "$RUNTIME_GROUP" -m 0750 "$CATALOG_IMPORT_ARCHIVE_PATH"
  runuser -u "$RUNTIME_USER" -- test -r "$MATMIX_DB_PATH"
  runuser -u "$RUNTIME_USER" -- test -r "$PRODUCT_UPLOADS_PATH"
  runuser -u "$RUNTIME_USER" -- test -w "$PRODUCT_UPLOADS_PATH"
  runuser -u "$RUNTIME_USER" -- test -r "$ORDER_ATTACHMENTS_PATH"
  runuser -u "$RUNTIME_USER" -- test -w "$ORDER_ATTACHMENTS_PATH"
  runuser -u "$RUNTIME_USER" -- test -r "$CATALOG_IMPORT_ARCHIVE_PATH"
  runuser -u "$RUNTIME_USER" -- test -w "$CATALOG_IMPORT_ARCHIVE_PATH"
  runuser -u "$RUNTIME_USER" -- test -w "$BACKUP_ROOT_PATH"
}

extract_backup_path() {
  local output="$1"
  local line
  local found=""

  while IFS= read -r line; do
    if [[ "$line" == "Backup created: "* ]]; then
      found="${line#Backup created: }"
    fi
  done <<< "$output"

  [[ -n "$found" ]] || return 1
  readlink -f "$found"
}

restore_exact_backup() {
  local release="$1"
  local backup_path="$2"

  echo "Restoring verified pre-deployment data backup: $backup_path"
  run_in_release "$release" node backend/scripts/restore-production-data.js \
    "$backup_path" --dry-run
  run_in_release "$release" node backend/scripts/restore-production-data.js \
    "$backup_path" --apply --confirm RESTORE_MATMIX_DATA
}

recover_failed_deployment() {
  local old_target="$1"
  local release_dir="$2"
  local backup_path="$3"
  local restore_data="$4"

  trap - ERR
  set +e
  echo "Deployment failed. Restoring previous release: $old_target" >&2
  if ! systemctl stop "$SERVICE" || systemctl is-active --quiet "$SERVICE"; then
    echo "CRITICAL: service could not be stopped; refusing to restore data." >&2
    return 1
  fi
  if [[ -e "$APP_RUNTIME_LOCK_PATH" ]]; then
    echo "CRITICAL: runtime lock remains; refusing to restore data." >&2
    return 1
  fi

  local restore_status=0
  if [[ "$restore_data" == "true" ]]; then
    restore_exact_backup "$release_dir" "$backup_path" || restore_status=$?
    if [[ "$restore_status" -eq 0 ]]; then
      run_in_release "$old_target" npm run database:health -- --json || restore_status=$?
    fi
  fi

  if [[ "$restore_status" -ne 0 ]]; then
    echo "CRITICAL: exact data restore failed; service remains stopped for manual recovery." >&2
    return 1
  fi

  atomic_switch "$old_target"
  systemctl start "$SERVICE"
  sleep 3

  if systemctl is-active --quiet "$SERVICE" \
      && health_check; then
    echo "ROLLBACK_COMPLETED=$old_target"
    [[ -z "$backup_path" ]] || echo "ROLLBACK_BACKUP=$backup_path"
    return 0
  fi

  echo "CRITICAL: automatic rollback failed; keep the failed release and exact backup for diagnosis." >&2
  systemctl stop "$SERVICE"
  systemctl status "$SERVICE" --no-pager -l
  return 1
}

main() {
  require_root
  [[ $# -eq 1 ]] || { usage; exit 2; }

  local requested_commit="$1"
  local commit
  local release_name
  local release_dir
  local build_dir
  local old_target
  local backup_output
  local backup_path=""
  local data_migration_started="false"

  command -v flock >/dev/null || fail "flock is not installed."
  command -v git >/dev/null || fail "git is not installed."
  command -v npm >/dev/null || fail "npm is not installed."
  command -v rsync >/dev/null || fail "rsync is not installed."
  command -v curl >/dev/null || fail "curl is not installed."
  command -v runuser >/dev/null || fail "runuser is not installed."

  exec 9>"$DEPLOY_LOCK"
  flock -n 9 || fail "Another MatMix deployment is already running."

  [[ -d "$REPO/.git" ]] || fail "Repository not found: $REPO"
  [[ -L "$APP_LINK" ]] || fail "$APP_LINK must be a symlink before automated deployment."
  [[ -d "$RELEASES_ROOT" ]] || fail "Releases directory not found: $RELEASES_ROOT"

  if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
    fail "Repository working tree is not clean."
  fi

  commit="$(git -C "$REPO" rev-parse --verify "${requested_commit}^{commit}")"
  release_name="$(git -C "$REPO" rev-parse --short=12 "$commit")"
  release_dir="$RELEASES_ROOT/$release_name"
  build_dir="$BUILD_ROOT/$release_name"
  old_target="$(readlink -f "$APP_LINK")"

  [[ -d "$old_target" ]] || fail "Current runtime target does not exist: $old_target"

  echo "Current release: $old_target"
  echo "New commit: $commit"
  echo "New release: $release_dir"

  if [[ -e "$release_dir" ]]; then
    [[ -f "$release_dir/RELEASE_COMMIT" ]] || fail "Existing release has no RELEASE_COMMIT marker."
    [[ "$(cat "$release_dir/RELEASE_COMMIT")" == "$commit" ]] || fail "Existing release marker does not match commit."
    echo "Release directory already exists; reusing it."
  else
    remove_build_directory "$build_dir"
    install -d -o root -g root -m 0750 "$build_dir"

    git -C "$REPO" archive "$commit" | tar -x -C "$build_dir"
    printf '%s\n' "$commit" > "$build_dir/RELEASE_COMMIT"

    (
      cd "$build_dir"
      npm ci --omit=dev
      node --check backend/server.js
      node --check backend/scripts/migrate-database.js
      node --check backend/scripts/check-database-health.js
      node --check backend/scripts/audit-order-attachments.js
      node --check backend/scripts/check-production-readiness.js
      node --check backend/scripts/backup-production-data.js
      node --check backend/scripts/restore-production-data.js
      npm run test:database-integrity
      npm run backup:verify-restore
      npm run test:production-readiness
      npm run test:lifecycle
      npm run test:deployment-rollout
    )

    install -d -o root -g "$RUNTIME_GROUP" -m 0750 "$release_dir"
    rsync -a --delete --chown=root:"$RUNTIME_GROUP" --chmod=D750,F640 \
      "$build_dir/" "$release_dir/"

    remove_build_directory "$build_dir"
  fi

  [[ "$(cat "$release_dir/RELEASE_COMMIT")" == "$commit" ]] \
    || fail "Release marker verification failed."

  load_production_environment
  validate_runtime_configuration "$release_dir"

  run_in_release "$release_dir" node -e "
    const sqlite3 = require('./node_modules/sqlite3');
    console.log({
      sqlite3: require('./node_modules/sqlite3/package.json').version,
      sqlite: sqlite3.VERSION
    });
  "

  deployment_error() {
    local exit_code=$?
    recover_failed_deployment \
      "$old_target" "$release_dir" "$backup_path" "$data_migration_started" || true
    exit "$exit_code"
  }
  trap deployment_error ERR

  echo "Stopping $SERVICE before backup and migration..."
  systemctl stop "$SERVICE"
  if systemctl is-active --quiet "$SERVICE"; then
    echo "ERROR: Service did not stop." >&2
    false
  fi
  if [[ -e "$APP_RUNTIME_LOCK_PATH" ]]; then
    echo "ERROR: Runtime lock still exists: $APP_RUNTIME_LOCK_PATH" >&2
    false
  fi

  if ! backup_output="$(
    run_in_release "$release_dir" node backend/scripts/backup-production-data.js
  )"; then
    recover_failed_deployment "$old_target" "$release_dir" "" "false" || true
    trap - ERR
    fail "Verified pre-deployment backup failed; migration was not started."
  fi
  printf '%s\n' "$backup_output"
  if ! backup_path="$(extract_backup_path "$backup_output")"; then
    recover_failed_deployment "$old_target" "$release_dir" "" "false" || true
    trap - ERR
    fail "Backup command did not return an exact backup path."
  fi
  if [[ "$backup_path" != "$(readlink -f "$BACKUP_ROOT_PATH")/"* ]]; then
    recover_failed_deployment "$old_target" "$release_dir" "" "false" || true
    trap - ERR
    fail "Backup path is outside BACKUP_ROOT_PATH."
  fi
  run_in_release "$release_dir" node backend/scripts/backup-production-data.js \
    --verify-only "$backup_path"

  echo "Reviewing migration from the existing schema..."
  run_in_release "$release_dir" npm run database:migrate -- --dry-run

  data_migration_started="true"
  echo "Applying schema migration with the new release..."
  run_in_release "$release_dir" npm run database:migrate -- \
    --apply --confirm MIGRATE_MATMIX_DATABASE

  echo "Verifying migrated data and runtime readiness before symlink switch..."
  run_in_release "$release_dir" npm run database:health -- --json
  run_in_release "$release_dir" npm run attachments:audit -- --check --json
  run_in_release "$release_dir" npm run production:check

  echo "Switching runtime symlink after successful migration and readiness..."
  atomic_switch "$release_dir"

  systemctl start "$SERVICE"
  sleep 3
  systemctl is-active --quiet "$SERVICE"
  health_check

  echo "Repeating operational checks after service startup..."
  run_in_release "$release_dir" npm run database:health -- --json
  run_in_release "$release_dir" npm run attachments:audit -- --check --json
  run_in_release "$release_dir" npm run production:check

  trap - ERR
  echo "DEPLOYMENT_SUCCESS=$release_name"
  echo "ACTIVE_RELEASE=$release_dir"
  echo "ROLLBACK_RELEASE=$old_target"
  echo "ROLLBACK_BACKUP=$backup_path"
}

main "$@"
