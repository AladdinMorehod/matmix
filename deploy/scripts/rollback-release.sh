#!/usr/bin/env bash
set -Eeuo pipefail

SERVICE="matmix"
RUNTIME_USER="matmix"
RELEASES_ROOT="/opt/matmix/releases"
APP_LINK="/opt/matmix/app"
ENV_FILE="/etc/matmix/matmix.env"
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
  echo "Usage: sudo $0 <release-name-or-absolute-release-path> <exact-verified-backup-path>"
  echo "Example: sudo $0 pre-1f14019-20260722T082651Z /var/backups/matmix/matmix-backup-..."
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
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

run_in_release() {
  local release="$1"
  shift
  (
    cd "$release"
    runuser -u "$RUNTIME_USER" --preserve-environment -- "$@"
  )
}

main() {
  [[ "${EUID}" -eq 0 ]] || fail "Run this script with sudo."
  [[ $# -eq 2 ]] || { usage; exit 2; }
  [[ -L "$APP_LINK" ]] || fail "$APP_LINK is not a symlink."
  [[ -r "$ENV_FILE" ]] || fail "Environment file is unavailable: $ENV_FILE"

  command -v flock >/dev/null || fail "flock is not installed."
  exec 9>"$DEPLOY_LOCK"
  flock -n 9 || fail "Another MatMix deployment or rollback is already running."

  local requested="$1"
  local requested_backup="$2"
  local target
  local current
  local backup_path

  if [[ "$requested" = /* ]]; then
    target="$(readlink -f "$requested")"
  else
    target="$(readlink -f "$RELEASES_ROOT/$requested")"
  fi

  current="$(readlink -f "$APP_LINK")"
  backup_path="$(readlink -f "$requested_backup")"

  [[ -d "$target" ]] || fail "Release does not exist: $target"
  [[ "$target" == "$RELEASES_ROOT/"* ]] || fail "Target must be inside $RELEASES_ROOT."
  [[ "$target" != "$current" ]] || fail "Requested release is already active."
  [[ -d "$backup_path" ]] || fail "Backup does not exist: $backup_path"

  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a

  [[ -n "${BACKUP_ROOT_PATH:-}" ]] || fail "BACKUP_ROOT_PATH is required."
  [[ "$backup_path" == "$(readlink -f "$BACKUP_ROOT_PATH")/"* ]] \
    || fail "Rollback requires an exact backup inside BACKUP_ROOT_PATH."

  echo "Current release: $current"
  echo "Rollback target: $target"
  echo "Rollback backup: $backup_path"

  run_in_release "$current" node backend/scripts/backup-production-data.js \
    --verify-only "$backup_path"

  systemctl stop "$SERVICE"
  [[ ! -e "${APP_RUNTIME_LOCK_PATH:-/var/lib/matmix/matmix-runtime.lock}" ]] \
    || fail "Runtime lock still exists."

  if ! run_in_release "$current" node backend/scripts/restore-production-data.js \
      "$backup_path" --dry-run; then
    echo "Data restore failed. Keeping the current release active." >&2
    systemctl start "$SERVICE"
    fail "Rollback data restore dry-run failed."
  fi
  if ! run_in_release "$current" node backend/scripts/restore-production-data.js \
      "$backup_path" --apply --confirm RESTORE_MATMIX_DATA; then
    fail "Rollback data restore apply failed; service remains stopped for manual recovery."
  fi

  run_in_release "$target" npm run database:health -- --json
  atomic_switch "$target"

  if systemctl start "$SERVICE"; then
    sleep 3
    if systemctl is-active --quiet "$SERVICE" && health_check; then
      echo "ROLLBACK_SUCCESS=$target"
      echo "ROLLBACK_BACKUP=$backup_path"
      echo "PREVIOUS_RELEASE=$current"
      exit 0
    fi
  fi

  echo "Rollback target failed after data restore; manual recovery is required." >&2
  systemctl stop "$SERVICE" || true
  systemctl status "$SERVICE" --no-pager -l
  fail "Do not select another backup or delete either release until the restored data is inspected."
}

main "$@"
