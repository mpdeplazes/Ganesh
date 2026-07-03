# Verification checklist

v1 was built and reviewed in a sandbox without Docker; the items below were
then verified on a real machine. The Windows section is the release gate
before recommending Windows to anyone.

## Mac (Docker Desktop running, from repo root)

_Automated pass 2026-07-03 (Docker 24.0.6, Docker Desktop). Note: running
`ganesh doctor` self-heals (reverts) uncommitted edits to ganesh's
own tracked files — commit fixes so `doctor` doesn't wipe them._

- [x] 1. `docker compose -f container/compose.yaml config` — schema-validates cleanly. PASS (resolves `CLAUDE_CODE_VERSION=2.1.199`).
- [x] 2. `scripts/smoke.sh` → `SMOKE PASS` (build, in-container `claude --version`, hook tests, ro-mount rejection, projects/state rw). PASS — `claude --version` = `2.1.199`, 5/5 hook tests green.
- [x] 3. Entrypoint sync: `docker compose -f container/compose.yaml run --rm claude sh -c 'ls /home/node/.claude'` → `CLAUDE.md settings.json hooks skills`. PASS.
- [x] 4. Launcher round trip: `GANESH_NO_EXEC=1 bin/ganesh` twice — first run may print "Installing some improvements…", second must not; `state/image-hash` holds a 64-char hash. PASS — first built, second silent, 64-char stable hash.
- [x] 5. Real session: `bin/ganesh` → greeting offers new/continue. The one-time bypass-permissions acceptance dialog appears; confirm it does NOT reappear after `docker compose -f container/compose.yaml up -d --force-recreate` (persists in `state/claude-home`). PASS — confirmed working in a live session (2026-07-03).
- [~] 6. Playwright end-to-end: in-session, ask for a screenshot (`show-me` flow) — validates the pinned `@playwright/mcp@0.0.77` ↔ `playwright@1.62.0-alpha-2026-06-29` browser pairing that smoke never exercises. **BUG FOUND + FIXED:** `container/mcp.json` invoked `mcp-server-playwright` (exit 127 — that binary does not exist in `@playwright/mcp@0.0.77`; the real bin is `playwright-mcp`). Fixed. Post-fix: headless chromium-1229 screenshot OK, and the MCP server answers an `initialize` handshake. Full in-session `show-me` still needs a live login session.
- [x] 7. Stop-hook live: create/dirty a project, end the turn, `git -C projects/<name> log --oneline` shows a `Saved your work:` commit. PASS (hook logic) — ran the real `stop-checkpoint.mjs` in-container against a temp project (kept `projects/` untouched); produced `Saved your work: 1 file (index.html)`, tree left clean. Stop-event trigger itself needs a live session; wiring confirmed in `settings.json`.
- [x] 8. Compaction continuity: `/compact` mid-session → post-compact re-anchor context fires; session continues without re-asking answered questions. DEFERRED — assumed working (maintainer sign-off 2026-07-03); `post-compact.mjs` content + `settings.json` `compact` matcher confirmed statically.
- [x] 9. Config-propagation seam: with the container running, edit any file under `container/home/`, run `ganesh` → cache-hit rebuild + force-recreate; change visible at `/home/node/.claude/...`. PASS — marker propagated in, then cleared on revert+relaunch.
- [x] 10. Doctor with real Docker: `ganesh doctor` all-ok exit 0; `ganesh doctor --machine | grep -c '^DOCTOR|'` → 8. PASS — with a real sign-in present, `doctor` is all-ok exit 0 with 8 `DOCTOR|` lines.
- [x] 11. `ganesh help` → bundle lands on Desktop, message prints the real path. PASS.
- [ ] 12. Launcher pull and doctor fetch against the GitHub remote neither prompt for credentials nor hang (`GIT_TERMINAL_PROMPT=0` paths). Verify on a fresh clone of the public repo.

## Windows 11 VM (release gate before recommending Windows)

- [ ] 13. Full day-one wizard from a clean clone (install git + Claude Code, clone, `claude`, "set me up").
- [ ] 14. Run `ganesh` from BOTH Windows Terminal and the Git Bash/mintty icon — `docker compose exec` interactive TTY is a classic mintty failure mode.
- [ ] 15. Docker Desktop autostart via the shim (`cmd.exe //c` path-conversion guard) actually launches it.
- [ ] 16. OneDrive-redirected Desktop: `ganesh help` message points at the real bundle location.
- [ ] 17. PowerShell PATH step (temp `.ps1` approach) adds the user-scope PATH entry; `ganesh` resolves in a NEW terminal.
- [ ] 18. `wsl --install` → reboot → "continue setup" resume path works.

## Logged (not blocking; revisit opportunistically)

- entrypoint `cp` aborts loudly if `container/home/.claude/hooks|skills` ever vanish (guaranteed present by tracked files today).
- `state/claude-home` ownership on native Linux Docker engines (target is Docker Desktop).
- Checkpoint commit titles garble porcelain rename entries (cosmetic, rare).
- `DOCTOR|updates|ok|behind=N` is a 3-field ok line (nothing parses machine lines yet).
- Help bundle includes "docker: command not found" noise when Docker is absent (maintainer-facing, arguably useful).
- `scripts/smoke.sh` skips `docker compose down` if an earlier step fails (leftover container is useful for debugging; `trap` cleanup is a fine future tweak).
- Curated `permissions.allow` list for Mechanic-session setup commands would reduce day-one permission prompts.
- uv/uvx copied from ghcr.io/astral-sh/uv:latest at image build (unpinned bootstrap tool; pin if drift ever bites).
