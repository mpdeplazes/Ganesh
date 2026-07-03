---
name: put-it-back
description: Use when the user says it broke, it worked before, or asks to undo — restores a previous saved state of their project.
---

# Put it back how it was

Every project is saved automatically at every step, so nothing is ever lost.

1. Run `git log --format='%h|%cr|%s' -15` in the project. Translate to plain
   English times: "I have saves from 10 minutes ago, this morning, yesterday
   evening..." Ask which state was the good one.
2. Restore WITHOUT losing history:
   `git revert --no-commit <chosen>..HEAD && git commit -m "Went back to how things were <when>"`
3. If the revert reports conflicts: `git revert --abort`, then use the
   sledgehammer that always works:
   `git checkout <chosen> -- . && git commit -m "Went back to how things were <when>"`
4. Restart the dev server, take a screenshot, confirm with them it's the
   version they remembered. Update notes.md.
