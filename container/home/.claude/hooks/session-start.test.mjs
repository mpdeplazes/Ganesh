import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksDir = dirname(fileURLToPath(import.meta.url));

function run(projects, handoffs = mkdtempSync(join(tmpdir(), 'ec-ho-'))) {
  return execFileSync('node', [join(hooksDir, 'session-start.mjs')], {
    env: { ...process.env, GANESH_PROJECTS: projects, GANESH_HANDOFFS: handoffs },
    encoding: 'utf8',
  });
}

test('lists projects with their first notes line', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  mkdirSync(join(projects, 'recipe-box', '.ganesh'), { recursive: true });
  writeFileSync(
    join(projects, 'recipe-box', '.ganesh', 'notes.md'),
    '# notes\nSaving grandma recipes; search works, photos next.\n'
  );
  const out = run(projects);
  assert.match(out, /recipe-box: Saving grandma recipes; search works, photos next\./);
});

test('says so when there are no projects', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  assert.match(run(projects), /No projects yet/);
});

test('surfaces the newest open handoff, ignores picked-up ones', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  const handoffs = mkdtempSync(join(tmpdir(), 'ec-ho-'));
  writeFileSync(
    join(handoffs, '2026-07-06-0900-old.md'),
    '---\nstatus: picked-up\n---\n# Handoff: old\n'
  );
  writeFileSync(
    join(handoffs, '2026-07-07-1830-recipe-photos.md'),
    '---\ncreated: 2026-07-07T18:30\nslug: recipe-photos\nstatus: open\n---\n# Handoff: photos\n'
  );
  const out = run(projects, handoffs);
  assert.match(out, /2026-07-07-1830-recipe-photos\.md/);
  assert.match(out, /pickup-handoff/);
  assert.doesNotMatch(out, /old\.md/);
});

test('stays quiet when there are no open handoffs', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  assert.doesNotMatch(run(projects), /pickup-handoff/);
});

test('skips a broken project but still lists healthy ones', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  mkdirSync(join(projects, 'good-project', '.ganesh'), { recursive: true });
  writeFileSync(
    join(projects, 'good-project', '.ganesh', 'notes.md'),
    '# notes\nHealthy project notes.\n'
  );
  // Broken project: notes.md is a directory (not a file), so readFileSync throws.
  mkdirSync(join(projects, 'broken-project', '.ganesh', 'notes.md'), { recursive: true });
  const out = run(projects);
  assert.match(out, /good-project: Healthy project notes\./);
});
