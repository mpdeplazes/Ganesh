#!/usr/bin/env node
// Fires right after auto-compaction (SessionStart matcher "compact"):
// re-anchors the session so continuity survives a condensed context.
console.log(
  'Context was just condensed. Re-anchor before continuing: which project is ' +
    'active, what already works, what is half-done right now, the exact next ' +
    'step, and everything the user approved or rejected. Continue seamlessly — ' +
    'never re-ask questions that were already answered.'
);
process.exit(0);
