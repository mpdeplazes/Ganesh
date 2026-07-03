#!/usr/bin/env node
// Auto-commits every dirty project so the user can never lose work.
// Must never block the session: swallow all errors, always exit 0.
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const projectsDir = process.env.GANESH_PROJECTS ?? '/workspace/projects';
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();

try {
  for (const name of readdirSync(projectsDir)) {
    try {
      const dir = join(projectsDir, name);
      if (!existsSync(join(dir, '.git'))) continue;
      const status = git(dir, 'status', '--porcelain');
      if (!status) continue;
      const files = status.split('\n').map((l) => l.slice(3)).filter(Boolean);
      const shown = files.slice(0, 3).join(', ');
      const extra = files.length > 3 ? ` and ${files.length - 3} more` : '';
      const plural = files.length === 1 ? 'file' : 'files';
      git(dir, 'add', '-A');
      git(dir, 'commit', '-m', `Saved your work: ${files.length} ${plural} (${shown}${extra})`);
    } catch {
      // Skip this project, keep checkpointing the others.
    }
  }
} catch {
  // projects dir unreadable — nothing to do.
}
process.exit(0);
