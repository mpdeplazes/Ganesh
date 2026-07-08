---
name: pickup-handoff
description: Use at the start of a fresh session when the user wants to pick up where they left off — or when session context says an unfinished-session note exists.
---

# Pickup Handoff

Resume work from the most recent handoff file written by the **handoff**
skill. The handoff is the source of *session* state; project state lives in
`.ganesh/notes.md`. If no handoff exists, use the **continue** skill instead —
notes are the normal way back into a project.

## Process

1. **Locate**: newest `/workspace/state/handoffs/*.md` with `status: open`.
   If none exist, say so and fall back to the continue skill.
2. **Staleness check**: if the newest is `status: picked-up` or much older
   than the last saved work, mention its age and check with the user before
   acting on it — things may have moved on.
3. **Verify before trusting**: re-run the read-only checks behind *Verified
   state* — `git status` / `git log` per project, is the server actually
   running. The handoff records what WAS true; a mismatch means something
   changed since — say so plainly, don't silently reconcile.
4. **Load pointers lazily**: read only the files the *Next* action needs.
   Do not re-explore everything — that is what the handoff exists to prevent.
5. **Re-ground the user** in one short, plain-English message: where things
   stand, anything that changed, and anything still waiting on them.
6. **Mark consumed** (after re-grounding, so a failed pickup doesn't burn the
   handoff): set `status: picked-up` in the frontmatter and add
   `picked_up: <ISO timestamp>`. Then do the *Next* step — unless it is
   blocked on user input, in which case ask exactly that and nothing else.

## Rules

- The handoff outranks your guesses but not reality: mismatches are findings
  to report, not errors in the world.
- The user's live messages outrank anything in the file.
- Don't dump the file's contents at the user — one-sentence summary,
  everyday words.
- If both a handoff and a compaction summary exist, the handoff wins on
  conflicts — it was written deliberately.
