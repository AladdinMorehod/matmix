#!/usr/bin/env bash
set -Eeuo pipefail

SERVICE="matmix"
RELEASES_ROOT="/opt/matmix/releases"
APP_LINK="/opt/matmix/app"
HEALTH_URLS=(
  "http://127.0.0.1:3000/health"
  "http://127.0.0.1:3000/health/ready"
  "http://127.0.0.1:3000/ready"
)

usage() {
  echo "Usage: sudo $0 <release-name-or-absolute-release-path>"
  echo "Example: sudo $0 pre-1f14019-20260722T082651Z"
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

main() {
  [[ "${EUID}" -eq 0 ]] || fail "Run this script with sudo."
  [[ $# -eq 1 ]] || { usage; exit 2; }
  [[ -L "$APP_LINK" ]] || fail "$APP_LINK is not a symlink."

  local requested="$1"
  local target
  local current

  if [[ "$requested" = /* ]]; then
    target="$(readlink -f "$requested")"
  else
    target="$(readlink -f "$RELEASES_ROOT/$requested")"
  fi

  current="$(readlink -f "$APP_LINK")"

  [[ -d "$target" ]] || fail "Release does not exist: $target"
  [[ "$target" == "$RELEASES_ROOT/"* ]] || fail "Target must be inside $RELEASES_ROOT."
  [[ "$target" != "$current" ]] || fail "Requested release is already active."

  echo "Current release: $current"
  echo "Rollback target: $target"

  systemctl stop "$SERVICE"
  [[ ! -e /var/lib/matmix/matmix-runtime.lock ]] || fail "Runtime lock still exists."

  atomic_switch "$target"

  if systemctl start "$SERVICE"; then
    sleep 3
    if systemctl is-active --quiet "$SERVICE" && health_check; then
      echo "ROLLBACK_SUCCESS=$target"
      echo "PREVIOUS_RELEASE=$current"
      exit 0
    fi
  fi

  echo "Rollback target failed. Restoring previous release: $current" >&2
  systemctl stop "$SERVICE" || true
  atomic_switch "$current"
  systemctl start "$SERVICE"
  sleep 3

  systemctl is-active --quiet "$SERVICE" && health_check \
    || fail "Both requested rollback and restoration of previous release failed."

  echo "ROLLBACK_REVERTED=$current"
  exit 1
}

main "$@"
