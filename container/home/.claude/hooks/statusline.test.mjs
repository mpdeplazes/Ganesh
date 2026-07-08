import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksDir = dirname(fileURLToPath(import.meta.url));

// Run the statusline with a given input blob; strip ANSI codes for asserting.
function run(input) {
  return execFileSync('node', [join(hooksDir, 'statusline.mjs')], {
    input: JSON.stringify(input),
    encoding: 'utf8',
  }).replace(/\x1b\[[0-9;]*m/g, '');
}

test('shows cwd, branch, context usage, and metered cost', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ec-'));
  execFileSync('git', ['init', '-b', 'main'], { cwd: dir });
  const transcript = join(dir, 'transcript.jsonl');
  writeFileSync(
    transcript,
    JSON.stringify({ message: { usage: { input_tokens: 1000 } } }) +
      '\n' +
      JSON.stringify({
        message: {
          usage: { input_tokens: 40000, cache_read_input_tokens: 10000 },
        },
      }) +
      '\n'
  );
  const out = run({
    cwd: dir,
    model: { id: 'claude-fable-5' },
    transcript_path: transcript,
    cost: { total_cost_usd: 1.5 },
  });
  assert.match(out, /⎇ main/);
  assert.match(out, /ctx 50\.0k \(5%\)/); // 50k of a 1M window
  assert.match(out, /\$1\.5000/);
});

test('hides zero cost (subscription sessions)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ec-'));
  const out = run({ cwd: dir, cost: { total_cost_usd: 0 } });
  assert.ok(!out.includes('$'));
  assert.ok(out.length > 0); // still shows the cwd
});

test('survives empty stdin', () => {
  const out = execFileSync('node', [join(hooksDir, 'statusline.mjs')], {
    input: '',
    encoding: 'utf8',
  });
  assert.ok(out.length > 0);
});
