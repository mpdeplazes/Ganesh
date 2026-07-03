#!/usr/bin/env bash
# Pre-push gate: build, version, hook tests, mount policy. Run from anywhere.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
export CLAUDE_CODE_VERSION="$(cat container/claude-code-version)"
C="docker compose -f container/compose.yaml"

echo "[1/5] build image"
$C build

echo "[2/5] claude --version"
$C run --rm claude claude --version

echo "[3/5] hook tests (inside container)"
$C run --rm claude sh -c 'node --test /workspace/container/home/.claude/hooks/*.test.mjs'

echo "[4/5] repo mount is read-only"
if $C run --rm claude sh -c 'touch /workspace/VERSION' 2>/dev/null; then
  echo "FAIL: repo mount is writable"; exit 1
fi

echo "[5/5] projects/ and state/ are writable"
$C run --rm claude sh -c 'touch /workspace/projects/.smoke /workspace/state/.smoke && rm /workspace/projects/.smoke /workspace/state/.smoke'

$C down
echo "SMOKE PASS"
