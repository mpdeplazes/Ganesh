---
name: handoff
description: Use when a session is ending mid-task and a fresh session will continue the work — context running low, the user stopping partway through something, or the user asks to hand off, save everything, or "pick this up next time".
---

# Handoff

Write the session's state to a file a fresh session can resume from, instead
of relying on compaction. Counterpart: the **pickup-handoff** skill.

**Handoff vs finish-up:** at a natural stopping point with nothing in flight,
**finish-up** is enough. A handoff is for stopping mid-task — half-built
features, open questions, decisions that so far exist only in this
conversation.

**Division of labor:** durable facts (preferences, decisions that outlive
this session) go to memory; project status goes in the project's
`.ganesh/notes.md`; the handoff carries only what exists nowhere else —
*session* state. Don't restate what a pointer already records.

## Process

1. **Flush first**: update the project's `.ganesh/notes.md` and save durable
   facts to memory, so the handoff only has to carry session state.
2. **Gather verifiable state** for everything touched this session:
   `git status -sb` and `git log -1 --oneline` per project touched; whether
   the dev server is running and on which port; what the last screenshot
   showed.
3. **Write the file** to `/workspace/state/handoffs/YYYY-MM-DD-HHMM-<slug>.md`
   (create the folder if missing; short kebab slug) using the template below.
   Every section is REQUIRED — write `none` rather than omitting one.
4. **Tell the user in plain words**: their work is saved, and next time they
   can just type `ganesh` and say "pick up where we left off."

## Template

```markdown
---
created: <ISO 8601 with time>
slug: <kebab-slug>
status: open
---
# Handoff: <one-line title>

## Objective
Why this work exists — what the user is building and for whom. 2-3 sentences max.

## Next
The exact next action, imperative and executable ("run X, expect Y"), plus its
precondition if any. If a short sequence, ordered list with step 1 executable as-is.

## Verified state
Facts checked THIS session, with evidence: project@sha (clean/dirty), commands
run + results, server running or not, what the last screenshot showed.

## Unverified / assumed
Claims taken from notes or earlier sessions that were NOT re-checked here.

## Waiting on the user
Questions asked but unanswered; choices only the user can make. Quote the
question, not a summary of it.

## Session context not on disk
Verbal decisions, corrections, in-flight discussion, and nuance from this
conversation that no file records. This is the section compaction loses —
be generous here.

## Pointers
Paths to the notes/plan files that carry the rest. One line each:
path — what it holds. Do not restate their content.
```

## Rules

- Facts carry evidence (exact commands and their results), not vibes
  ("it works" → "checkpoint a1b2c3d, screenshot showed the login page").
- "Next" is one concrete action a fresh session can execute without asking
  anything, or it names exactly what input blocks it.
- Never put passwords or personal data in a handoff.
- Write the handoff even if the session feels "cleanly finished" — the
  baseline failure is a fresh session unable to tell a clean stop from an
  interrupted one.
- The jargon stays in the file; what you SAY to the user stays in everyday
  words.
