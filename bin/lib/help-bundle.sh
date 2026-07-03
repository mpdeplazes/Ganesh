#!/usr/bin/env bash
# Bundle everything a helper needs into one text file the user can send.
set -uo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$(dirname "$LIB_DIR")")"

dest_dir="$HOME/Desktop"; [ -d "$dest_dir" ] || dest_dir="$HOME"
out="$dest_dir/ganesh-help-$(date '+%Y%m%d-%H%M').txt"

{
  echo "Ganesh help bundle — $(date)"
  echo "version: $(cat "$REPO_DIR/VERSION" 2>/dev/null || echo '?')"
  echo "system:  $(uname -a)"
  echo "docker:  $(docker --version 2>&1 || echo 'not found')"
  echo ""
  echo "===== checkup ====="
  bash "$LIB_DIR/doctor.sh" --machine 2>&1 || true
  echo ""
  echo "===== recent launcher log ====="
  tail -n 50 "$REPO_DIR/state/launcher.log" 2>/dev/null || echo "(no log yet)"
  echo ""
  echo "===== projects ====="
  for d in "$REPO_DIR"/projects/*/; do
    [ -d "$d/.git" ] || continue
    echo "--- $(basename "$d")"
    git -C "$d" log -5 --format='%ci  %s' 2>/dev/null
  done
} >"$out"

echo "Done! Your help file is ready here:"
echo "  $out"
echo "Text or email that file to your helper."
