#!/usr/bin/env bash
set -Eeuo pipefail

RELEASES_ROOT="/opt/matmix/releases"
APP_LINK="/opt/matmix/app"

KEEP_NORMAL=3
KEEP_PRE=2
APPLY=false

usage() {
  cat <<'USAGE'
Usage:
  sudo matmix-clean-releases [--apply] [--keep-normal N] [--keep-pre N]

Defaults:
  --keep-normal 3
  --keep-pre 2

Without --apply, the command only prints what would be removed.
USAGE
}

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

is_non_negative_integer() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY=true
      shift
      ;;
    --keep-normal)
      [[ $# -ge 2 ]] || fail "--keep-normal requires a value."
      KEEP_NORMAL="$2"
      shift 2
      ;;
    --keep-pre)
      [[ $# -ge 2 ]] || fail "--keep-pre requires a value."
      KEEP_PRE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

[[ "${EUID}" -eq 0 ]] || fail "Run this command with sudo."
is_non_negative_integer "$KEEP_NORMAL" || fail "--keep-normal must be a non-negative integer."
is_non_negative_integer "$KEEP_PRE" || fail "--keep-pre must be a non-negative integer."
[[ -d "$RELEASES_ROOT" ]] || fail "Releases directory not found: $RELEASES_ROOT"
[[ -L "$APP_LINK" ]] || fail "$APP_LINK must be a symlink."

ACTIVE="$(readlink -f "$APP_LINK")"
[[ -d "$ACTIVE" ]] || fail "Active release target does not exist: $ACTIVE"
[[ "$ACTIVE" == "$RELEASES_ROOT/"* ]] || fail "Active release is outside $RELEASES_ROOT."

mapfile -t NORMAL_RELEASES < <(
  find "$RELEASES_ROOT" \
    -mindepth 1 \
    -maxdepth 1 \
    -type d \
    ! -name 'pre-*' \
    -printf '%T@ %p\n' \
  | sort -nr \
  | cut -d' ' -f2-
)

mapfile -t PRE_RELEASES < <(
  find "$RELEASES_ROOT" \
    -mindepth 1 \
    -maxdepth 1 \
    -type d \
    -name 'pre-*' \
    -printf '%T@ %p\n' \
  | sort -nr \
  | cut -d' ' -f2-
)

declare -A KEEP=()
KEEP["$ACTIVE"]=1

for ((i = 0; i < ${#NORMAL_RELEASES[@]} && i < KEEP_NORMAL; i++)); do
  KEEP["${NORMAL_RELEASES[$i]}"]=1
done

for ((i = 0; i < ${#PRE_RELEASES[@]} && i < KEEP_PRE; i++)); do
  KEEP["${PRE_RELEASES[$i]}"]=1
done

declare -a DELETE=()

for release in "${NORMAL_RELEASES[@]}" "${PRE_RELEASES[@]}"; do
  [[ -n "$release" ]] || continue
  [[ -n "${KEEP[$release]:-}" ]] && continue
  DELETE+=("$release")
done

echo "Active release: $ACTIVE"
echo "Keep normal releases: $KEEP_NORMAL"
echo "Keep pre-* releases: $KEEP_PRE"
echo

echo "=== Kept releases ==="
for release in "${NORMAL_RELEASES[@]}" "${PRE_RELEASES[@]}"; do
  [[ -n "$release" ]] || continue
  if [[ -n "${KEEP[$release]:-}" ]]; then
    if [[ "$release" == "$ACTIVE" ]]; then
      printf 'KEEP ACTIVE  %s\n' "$release"
    else
      printf 'KEEP         %s\n' "$release"
    fi
  fi
done

echo
echo "=== Releases selected for deletion ==="
if [[ ${#DELETE[@]} -eq 0 ]]; then
  echo "None"
  exit 0
fi

for release in "${DELETE[@]}"; do
  [[ "$release" != "$ACTIVE" ]] || fail "Internal safety check blocked deletion of active release."
  [[ "$release" == "$RELEASES_ROOT/"* ]] || fail "Unsafe deletion target: $release"
  printf 'DELETE       %s  ' "$release"
  du -sh "$release" | awk '{print $1}'
done

if [[ "$APPLY" != true ]]; then
  echo
  echo "Dry run only. Re-run with --apply to delete the listed releases."
  exit 0
fi

echo
echo "=== Deleting releases ==="
for release in "${DELETE[@]}"; do
  [[ "$release" != "$ACTIVE" ]] || fail "Active release protection triggered."
  [[ "$release" == "$RELEASES_ROOT/"* ]] || fail "Unsafe deletion target: $release"
  rm -rf --one-file-system "$release"
  echo "DELETED $release"
done

echo
echo "Cleanup completed."
