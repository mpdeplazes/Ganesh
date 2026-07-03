#!/usr/bin/env bash
# ganesh doctor — must work when everything else is broken.
# Checks the chain in order; stops at the first broken link with a fix.
set -uo pipefail

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$(dirname "$LIB_DIR")")"
MACHINE="${1:-}"
export GIT_TERMINAL_PROMPT=0

m() { if [ "$MACHINE" = "--machine" ]; then echo "DOCTOR|$1|$2${3:+|$3}"; fi; return 0; }
ok() { echo "  [ok] $1"; m "$2" ok; }
bad() {
  echo ""
  echo "  [problem] $1"
  echo "  [fix] $2"
  m "$3" fail "$1"
  exit 1
}

echo "Ganesh checkup — version $(cat "$REPO_DIR/VERSION" 2>/dev/null || echo '?')"

# 1. Repo intact
if [ -f "$REPO_DIR/VERSION" ] && git -C "$REPO_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  ok "Your Ganesh folder looks healthy." repo
else
  bad "Your Ganesh folder is damaged or moved." \
      "Text your helper — this needs a fresh copy." repo
fi

# 2. Up to date (warn-only)
if git -C "$REPO_DIR" remote get-url origin >/dev/null 2>&1; then
  if git -C "$REPO_DIR" fetch --quiet 2>/dev/null; then
    behind="$(git -C "$REPO_DIR" rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
    if [ "$behind" -gt 0 ]; then
      echo "  [note] An update is waiting — it installs next time you run ganesh."
      m updates ok "behind=$behind"
    else
      ok "You have the latest version." updates
    fi
  else
    echo "  [note] Couldn't check for updates (no internet?). Not a problem."
    m updates ok offline
  fi
else
  ok "Running in local mode (no update source set up yet)." updates
fi

# 2b. Self-heal accidental edits to ganesh's own files (spec §12).
# Untracked files are left alone — nothing of the user's is tracked here.
dirty="$(git -C "$REPO_DIR" status --porcelain 2>/dev/null | grep -v '^??' || true)"
if [ -n "$dirty" ]; then
  git -C "$REPO_DIR" checkout HEAD -- . 2>/dev/null
  ok "Tidied up some accidental changes to ganesh's own files." repo_clean
else
  ok "ganesh's own files are untouched." repo_clean
fi

# 3–4. Docker
command -v docker >/dev/null 2>&1 \
  && ok "The app engine (Docker) is installed." docker_installed \
  || bad "The app engine (Docker) is missing." \
         "Reinstall Docker Desktop from https://www.docker.com/products/docker-desktop/ then run ganesh again." \
         docker_installed
docker info >/dev/null 2>&1 \
  && ok "The engine is running." docker_running \
  || bad "The engine isn't running." \
         "Open the Docker Desktop app, wait for it to say it's running, then try again." \
         docker_running

# 5. Image
docker image inspect ganesh:local >/dev/null 2>&1 \
  && ok "Your workspace is built." image \
  || bad "Your workspace hasn't been built yet." \
         "Run ganesh once — it builds automatically." image

# 6. Login
[ -s "$REPO_DIR/state/claude-home/.credentials.json" ] \
  && ok "You're signed in to Claude." login \
  || bad "You're not signed in to Claude inside the workspace." \
         "Run ganesh and follow the sign-in link it shows you." login

# 7. Disk (need 5 GB free)
free_kb="$(df -Pk "$REPO_DIR" | awk 'NR==2 {print $4}')"
if [ "${free_kb:-0}" -ge 5242880 ]; then
  ok "Plenty of disk space." disk
else
  bad "Your computer is low on disk space." \
      "Free up at least 5 GB (empty the trash, delete old downloads), then try again." disk
fi

echo ""
echo "Everything checks out. If something still feels wrong, run: ganesh help"
