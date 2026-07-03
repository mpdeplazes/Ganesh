#!/usr/bin/env bash
# Sync managed config from the read-only repo into the persistent config dir.
# Runs on every container start, so skill/hook fixes arrive via git pull
# with no image rebuild. Credentials/memory in the mounted dir are preserved.
set -euo pipefail

SRC=/workspace/container/home
CFG=/home/node/.claude

mkdir -p "$CFG"
cp -f  "$SRC/CLAUDE.md"              "$CFG/CLAUDE.md"
cp -f  "$SRC/.claude/settings.json"  "$CFG/settings.json"
rm -rf "$CFG/hooks" "$CFG/skills"
cp -r  "$SRC/.claude/hooks"          "$CFG/hooks"
cp -r  "$SRC/.claude/skills"         "$CFG/skills"

git config --global user.name  "Ganesh"
git config --global user.email "ganesh@local"
git config --global init.defaultBranch main
git config --global --add safe.directory '*'

exec "$@"
