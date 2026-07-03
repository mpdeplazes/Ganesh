# Ganesh

Build your own apps by talking to Claude. No coding experience needed.

Ganesh is a ready-made setup for running [Claude Code](https://claude.com/claude-code)
inside a container. It gives you a single `ganesh` command: type it in a
terminal, describe the app you want, and Claude plans it in plain English,
builds it, shows you screenshots, and keeps every version saved so nothing is
ever lost.

## What you need

- A Mac or Windows computer (Mac is the well-tested path — see Status below).
- A [Claude subscription](https://claude.com) (Pro or Max) — you sign in with
  your own account.
- Docker Desktop (free for personal use) — setup walks you through installing it.

## Getting started

Ideally someone technical (your **helper**) walks you through this the first
time. If you found this project on your own: congratulations, you are your
own helper.

1. Install [git](https://git-scm.com/downloads) and
   [Claude Code](https://claude.com/claude-code).
2. In a terminal:
   `git clone https://github.com/mpdeplazes/Ganesh.git ganesh`
   then `cd ganesh`, then `claude`.
3. Type: **set me up** — and follow along. Claude installs and configures
   everything (including Docker) and tells you exactly what to click.

**Every day after that:** open a terminal, type `ganesh`, start talking.

**If anything seems broken:** type `ganesh doctor`.
**If it's still broken:** type `ganesh help` and send your helper the
file it creates (no helper? open a GitHub issue).

## How it works

- Two roles: a plain `claude` session in this folder is the **Mechanic**
  (setup and repair); `ganesh` opens the **Builder** — a dangerous-mode
  Claude Code session inside a Docker container where your apps get made.
- The container can only write to `projects/` (your apps) and `state/` (its
  own settings and sign-in). The tool itself is mounted read-only, so nothing
  that happens while building can break Ganesh.
- Every work session auto-commits a checkpoint in each project, so "put it
  back how it was when it worked" always works.
- The launcher pulls this repo at startup, so fixes arrive automatically;
  changes under `container/` trigger an automatic rebuild.

## Connecting other apps

Inside a session you can ask Claude to connect to other tools — online
services sign in right in the chat, and apps running on your computer (like
Blender) can often be reached too. Claude knows how to set this up and will
say honestly when a connection only works outside the container.

## Status

- The Mac path is verified end-to-end — see `docs/verification-checklist.md`.
- The Windows path is implemented but **not yet verified on a real machine**.
  Expect rough edges; issues and PRs welcome.

## For maintainers and forkers

- Before pushing: `scripts/smoke.sh` must print `SMOKE PASS`.
- Users receive changes on their next `ganesh` run (fast-forward pull at
  launch). Any change under `container/` (including skills/hooks/CLAUDE.md
  under `container/home/`) triggers a rebuild+restart on their machine; for
  config-only changes the rebuild is an instant cache hit and the restart
  applies them via the entrypoint sync.
- Bump `VERSION` on anything user-visible; doctor prints it, help bundles it.
- Claude Code version: pinned in `container/claude-code-version`. To bump:
  `docker run --rm node:22-bookworm npm view @anthropic-ai/claude-code version`,
  write it there, run `scripts/smoke.sh`, push. Playwright MCP and its browser
  installer are pinned in `container/Dockerfile` — bump them together.
- Release gate before recommending Windows: full setup wizard on a Windows 11
  VM from a clean clone (`docs/verification-checklist.md`, items 13–18).
- Layout: host Mechanic config in `.claude/`; container Builder config in
  `container/home/`; users' apps in `projects/` (gitignored, one git repo
  each); machine state + login in `state/` (gitignored).
- Warning: `ganesh doctor` self-heals by discarding uncommitted changes
  to tracked files. Never run it with uncommitted edits in your working copy.

## License

MIT — see [LICENSE](LICENSE). Provided as-is with no warranty: use at your
own risk, change it, fork it, make it yours.
