#!/usr/bin/env node
// Stdout becomes session context: what projects exist and where they stand.
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const projectsDir = process.env.GANESH_PROJECTS ?? '/workspace/projects';

try {
  const lines = [];
  for (const name of readdirSync(projectsDir)) {
    try {
      const dir = join(projectsDir, name);
      if (name.startsWith('.') || !statSync(dir).isDirectory()) continue;
      let note = 'no notes yet';
      const notesPath = join(dir, '.ganesh', 'notes.md');
      if (existsSync(notesPath)) {
        const first = readFileSync(notesPath, 'utf8')
          .split('\n')
          .find((l) => l.trim() && !l.startsWith('#'));
        if (first) note = first.trim();
      }
      let saved = '';
      if (existsSync(join(dir, '.git'))) {
        try {
          saved = execFileSync('git', ['log', '-1', '--format=last saved %cr'], {
            cwd: dir,
            encoding: 'utf8',
          }).trim();
        } catch {}
      }
      lines.push(`- ${name}: ${note}${saved ? ` (${saved})` : ''}`);
    } catch {
      // Skip this project, keep listing the others.
    }
  }
  console.log(
    lines.length
      ? `Existing projects:\n${lines.join('\n')}`
      : 'No projects yet — this is a brand-new workspace.'
  );
} catch {}

// Surface an unfinished session (open handoff) so the greeting can offer
// to pick it up — friends won't know to ask for it by name.
const handoffsDir = process.env.GANESH_HANDOFFS ?? '/workspace/state/handoffs';
try {
  const open = readdirSync(handoffsDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .filter((f) => {
      try {
        const head = readFileSync(join(handoffsDir, f), 'utf8').slice(0, 500);
        return /^status:\s*open\s*$/m.test(head);
      } catch {
        return false;
      }
    });
  if (open.length) {
    console.log(
      `\nLast session ended mid-task and left a note (${open[open.length - 1]}). ` +
        'Offer to pick up where they left off (pickup-handoff skill) before anything else.'
    );
  }
} catch {}
process.exit(0);
