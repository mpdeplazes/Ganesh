#!/usr/bin/env bash
# Host-only: steer any first message into setup until it's done.
[ -n "${GANESH_CONTAINER:-}" ] && exit 0
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [ ! -f "$dir/state/setup-complete" ]; then
  echo "Setup has NOT been completed on this computer. Whatever the user's first message says — even just 'hi' — greet them warmly and start the setup skill now."
fi
exit 0
