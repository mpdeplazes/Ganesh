---
name: setup
description: Use when setup has not been completed, or the user says "set me up" — walks a non-engineer through Docker install, PATH, first launch, and sign-in.
---

# Set me up

Work through these in order. One step at a time; wait for each to finish.
Explain each step in one friendly sentence before running it. If a command
fails, read the error yourself and fix it — only involve the user for
clicks/reboots you can't do.

## 1. Detect the machine

`uname -s` → Darwin = Mac; MINGW/MSYS = Windows (Git Bash).

## 2. Docker Desktop

Skip to 3 if `docker --version` works.

**Windows:** run `winget install -e --id Docker.DockerDesktop`. If winget is
missing or it fails, send them to
https://www.docker.com/products/docker-desktop/ and talk through the
installer (defaults are fine). If Docker complains about WSL2: run
`wsl --install`, tell them a restart is needed, and that after restarting
they should open the terminal, `cd` into this folder, run `claude`, and say
"continue setup".

**Mac:** send them to https://www.docker.com/products/docker-desktop/
(pick Apple Silicon vs Intel via `uname -m`: arm64 = Apple Silicon). Talk
through: open the .dmg, drag to Applications, open Docker from Applications,
accept the prompts.

Then have them open Docker Desktop once and accept its terms. Verify:
`docker info` succeeds (retry ~30s while it starts).

## 3. Put ganesh on their PATH

Compute the absolute repo path first (`pwd` from the repo root).

**Mac:** append to `~/.zshrc`:
`export PATH="<repo>/bin:$PATH"`
(Use >> so nothing is overwritten. Create the file if missing.)

**Windows:** update the USER path only, preserving what's there. Write a temp
script first (bash expands `$` inside double quotes, so never inline this):
```bash
cat > /tmp/add-path.ps1 <<'PSEOF'
$p=[Environment]::GetEnvironmentVariable('Path','User')
if ($p -notlike '*ganesh\bin*') {
  [Environment]::SetEnvironmentVariable('Path', ($p.TrimEnd(';') + ';REPO_WINDOWS_PATH\bin'), 'User')
}
PSEOF
```
Replace REPO_WINDOWS_PATH with the real path (convert Git Bash form:
/c/Users/x/ganesh → C:\Users\x\ganesh), then run:
`powershell -ExecutionPolicy Bypass -File /tmp/add-path.ps1`
(Git Bash passes /tmp/... to PowerShell as a real Windows temp path.)

Verify in a NEW terminal: `ganesh doctor` prints the checkup.

## 4. Build the workspace

Run `bin/ganesh doctor` first (engine check), then do the first build by
running the launcher's build path: tell the user "this takes a few minutes"
and run:
`export CLAUDE_CODE_VERSION="$(cat container/claude-code-version)"`
then `docker compose -f container/compose.yaml build`
then `docker compose -f container/compose.yaml up -d`.
(The export must happen in the same shell before BOTH commands — compose
requires it for every command that reads the file, including step 5's exec.)

## 5. Sign in inside the workspace

Tell them: "A sign-in link will appear — open it in your browser, log in
with your Claude account, and paste the code back here." Then run:
(Requires the same `export CLAUDE_CODE_VERSION=...` from step 4 in the current shell — re-export if this is a fresh shell.)
`docker compose -f container/compose.yaml exec claude claude`
and guide them through the login prompts. When logged in, have them type
`/exit`. Verify `state/claude-home/.credentials.json` now exists.

## 6. Finish

- `touch state/setup-complete`
- Run `bin/ganesh doctor` — everything should pass.
- Tell them: "You're done. From now on: open a terminal, type `ganesh`,
  and start talking. Try it now!"
