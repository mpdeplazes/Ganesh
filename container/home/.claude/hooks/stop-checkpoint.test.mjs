import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' }).trim();

function makeProject(projects, name) {
  const dir = join(projects, name);
  mkdirSync(dir);
  git(dir, 'init');
  git(dir, 'config', 'user.email', 't@local');
  git(dir, 'config', 'user.name', 'T');
  return dir;
}

test('commits dirty projects with a friendly message', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  const app = makeProject(projects, 'my-app');
  writeFileSync(join(app, 'index.html'), '<h1>hi</h1>');

  execFileSync('node', [join(hooksDir, 'stop-checkpoint.mjs')], {
    env: { ...process.env, GANESH_PROJECTS: projects },
  });

  assert.equal(git(app, 'status', '--porcelain'), '');
  assert.match(git(app, 'log', '-1', '--format=%s'), /Saved your work: 1 file \(index\.html\)/);
});

test('tolerates clean projects, non-git folders, missing dir', () => {
  const projects = mkdtempSync(join(tmpdir(), 'ec-'));
  mkdirSync(join(projects, 'not-git'));
  execFileSync('node', [join(hooksDir, 'stop-checkpoint.mjs')], {
    env: { ...process.env, GANESH_PROJECTS: projects },
  });
  execFileSync('node', [join(hooksDir, 'stop-checkpoint.mjs')], {
    env: { ...process.env, GANESH_PROJECTS: join(projects, 'nope') },
  });
});
