#!/usr/bin/env bash
set -Eeuo pipefail

SERVICE="matmix"
REPO="/home/deploy/apps/matmix"
RELEASES_ROOT="/opt/matmix/releases"
APP_LINK="/opt/matmix/app"
ENV_FILE="/etc/matmix/matmix.env"
BUILD_ROOT="/var/tmp/matmix-build"
HEALTH_URLS=(
  "http://127.0.0.1:3000/health"
  "http://127.0.0.1:3000/health/ready"
  "http://127.0.0.1:3000/ready"
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

rollback() {
  local old_target="$1"

  echo "Deployment failed. Rolling back to: $old_target"
  systemctl stop "$SERVICE" || true
  atomic_switch "$old_target"

  if systemctl start "$SERVICE"; then
    sleep 3
    if systemctl is-active --quiet "$SERVICE" && health_check; then
      echo "ROLLBACK_COMPLETED=$old_target"
      return 0
    fi
  fi

  echo "CRITICAL: automatic rollback failed." >&2
  systemctl status "$SERVICE" --no-pager -l || true
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

  command -v git >/dev/null || fail "git is not installed."
  command -v npm >/dev/null || fail "npm is not installed."
  command -v rsync >/dev/null || fail "rsync is not installed."
  command -v curl >/dev/null || fail "curl is not installed."

  [[ -d "$REPO/.git" ]] || fail "Repository not found: $REPO"
  [[ -r "$ENV_FILE" ]] || fail "Environment file is unavailable: $ENV_FILE"
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
    rm -rf "$build_dir"
    install -d -o root -g root -m 0750 "$build_dir"

    git -C "$REPO" archive "$commit" | tar -x -C "$build_dir"
    printf '%s\n' "$commit" > "$build_dir/RELEASE_COMMIT"

    (
      cd "$build_dir"
      npm ci --omit=dev
      node --check backend/server.js
      node --check backend/scripts/check-production-readiness.js
      node --check backend/scripts/backup-production-data.js
      npm run test:database-integrity
      npm run backup:verify-restore
      npm run test:production-readiness
      npm run test:lifecycle
    )

    install -d -o root -g matmix -m 0750 "$release_dir"
    rsync -a --delete --chown=root:matmix --chmod=D750,F640 \
      "$build_dir/" "$release_dir/"

    rm -rf "$build_dir"
  fi

  [[ "$(cat "$release_dir/RELEASE_COMMIT")" == "$commit" ]] \
    || fail "Release marker verification failed."

  runuser -u matmix -- node -e "
    const sqlite3 = require('${release_dir}/node_modules/sqlite3');
    console.log({
      sqlite3: require('${release_dir}/node_modules/sqlite3/package.json').version,
      sqlite: sqlite3.VERSION
    });
  "

  echo "Stopping $SERVICE..."
  systemctl stop "$SERVICE"
  systemctl is-active --quiet "$SERVICE" && fail "Service did not stop."
  [[ ! -e /var/lib/matmix/matmix-runtime.lock ]] || fail "Runtime lock still exists."

  echo "Creating verified pre-deployment backup..."
  backup_output="$(
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    cd "$old_target"
    runuser -u matmix --preserve-environment -- \
      node backend/scripts/backup-production-data.js
  )"
  printf '%s\n' "$backup_output"

  echo "Switching runtime symlink..."
  atomic_switch "$release_dir"

  if systemctl start "$SERVICE"; then
    sleep 3
    if systemctl is-active --quiet "$SERVICE" && health_check; then
      echo "DEPLOYMENT_SUCCESS=$release_name"
      echo "ACTIVE_RELEASE=$release_dir"
      echo "ROLLBACK_RELEASE=$old_target"
      exit 0
    fi
  fi

  rollback "$old_target"
  exit 1
}

main "$@"
