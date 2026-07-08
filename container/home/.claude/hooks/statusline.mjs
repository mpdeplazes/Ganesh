#!/usr/bin/env node
// Claude Code statusline: cwd, git branch, context usage, session cost.
//
// Reads a JSON blob on stdin (provided by Claude Code on every render) and
// writes a single line to stdout. Key fields used:
//   cwd                    current working directory
//   model.id               model identifier (used to pick the context window)
//   transcript_path        JSONL transcript — last `usage` block = current ctx
//   cost.total_cost_usd    metered-API cost (subscription sessions report 0)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { sep } from 'node:path';

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

const SEP = ` ${DIM}|${RESET} `;

function contextWindow(modelId) {
  const mid = (modelId || '').toLowerCase();
  if (mid.includes('[1m]') || mid.includes('-1m')) return 1_000_000;
  // Current-generation models all carry 1M windows: Fable/Mythos 5,
  // Opus 4.6+, Sonnet 4.6+. Haiku 4.5 and unrecognized models fall
  // back to 200k.
  const markers = [
    'fable',
    'mythos',
    'opus-4-6',
    'opus-4-7',
    'opus-4-8',
    'sonnet-5',
    'sonnet-4-6',
  ];
  if (markers.some((m) => mid.includes(m))) return 1_000_000;
  return 200_000;
}

function shortenPath(path) {
  const home = homedir();
  if (path === home) return '~';
  if (path.startsWith(home + sep)) return '~' + path.slice(home.length);
  return path;
}

function gitBranch(cwd) {
  const run = (...args) => {
    try {
      const out = execFileSync('git', ['-C', cwd, ...args], {
        encoding: 'utf8',
        timeout: 1000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      return out || null;
    } catch {
      return null;
    }
  };
  const branch = run('symbolic-ref', '--short', 'HEAD');
  if (branch) return branch;
  const sha = run('rev-parse', '--short', 'HEAD');
  return sha ? `(${sha})` : null;
}

function contextUsed(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return 0;
  let text;
  try {
    text = readFileSync(transcriptPath, 'utf8');
  } catch {
    return 0;
  }
  let last = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const usage = obj?.message?.usage;
    if (usage) last = usage;
  }
  if (!last) return 0;
  return (
    (Number(last.input_tokens) || 0) +
    (Number(last.cache_read_input_tokens) || 0) +
    (Number(last.cache_creation_input_tokens) || 0)
  );
}

function pctColor(pct) {
  if (pct >= 80) return RED;
  if (pct >= 60) return YELLOW;
  return GREEN;
}

let data = {};
try {
  data = JSON.parse(readFileSync(0, 'utf8'));
} catch {}

const workspace = data.workspace || {};
const cwd = data.cwd || workspace.current_dir || process.cwd();
const modelId = data.model?.id || '';
const transcript = data.transcript_path || '';
const totalCost = data.cost?.total_cost_usd;

const parts = [`${CYAN}${shortenPath(cwd)}${RESET}`];

const branch = gitBranch(cwd);
if (branch) parts.push(`${MAGENTA}⎇ ${branch}${RESET}`);

const used = contextUsed(transcript);
if (used) {
  const window = contextWindow(modelId);
  const pct = window ? (used / window) * 100 : 0;
  const usedK = (used / 1000).toFixed(1);
  parts.push(`${pctColor(pct)}ctx ${usedK}k (${Math.round(pct)}%)${RESET}`);
}

// Friends log in with a subscription, which reports $0 — only show real spend.
if (typeof totalCost === 'number' && totalCost > 0) {
  parts.push(`${DIM}$${totalCost.toFixed(4)}${RESET}`);
}

process.stdout.write(parts.join(SEP));
