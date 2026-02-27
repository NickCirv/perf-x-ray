<p align="center">
  <img src="banner.svg" alt="perf-x-ray" width="600" />
</p>

<h1 align="center">perf-x-ray</h1>
<p align="center"><strong>Your codebase has performance bugs. This finds them.</strong></p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/npx-perf--x--ray-blue?style=flat-square" alt="npx perf-x-ray" /></a>
  <img src="https://img.shields.io/badge/10%20rules-built--in-green?style=flat-square" alt="10 rules built-in" />
  <img src="https://img.shields.io/badge/zero%20config-%E2%9C%93-brightgreen?style=flat-square" alt="zero config" />
  <img src="https://img.shields.io/badge/zero%20API%20keys-%E2%9C%93-brightgreen?style=flat-square" alt="zero API keys" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/NickCirv/perf-x-ray?style=flat-square" alt="MIT License" /></a>
</p>

<p align="center">
  <em>Static analysis for N+1 queries, sync I/O, ReDoS, O(n²) loops, and more.<br/>Runs in 200ms. No browser. No setup. Works in CI.</em>
</p>

---

## The problem

Your app is slow. You've been staring at Chrome DevTools for an hour. The real problem? It's not in the browser — it's in your code.

A `readFileSync` hiding in an async handler. A `SELECT *` with no `LIMIT`. A `forEach` nested inside a `map` that's quietly O(n²). A regex that locks the event loop on adversarial input.

These bugs don't show up in unit tests. They don't trigger linters. They wait until production traffic finds them.

**perf-x-ray catches them before that happens.**

```bash
npx perf-x-ray scan ./src
```

---

## Install

```bash
# Run immediately, no install needed
npx perf-x-ray scan

# Or install globally
npm install -g perf-x-ray
```

---

## Sample output

```
  perf-x-ray scanning ./src ...

  [CRITICAL]  sync-io
  !!! src/api/upload.js:47  readFileSync blocks the event loop
      fix: Use fs.promises.readFile with await

  [CRITICAL]  n-plus-one
  !!! src/services/orders.js:23  DB query inside forEach loop
      fix: Batch fetch with findMany({ where: { id: { in: ids } } })

  [HIGH]  nested-loops
  !! src/utils/matcher.js:89  Nested .filter inside .map — O(n²)
      fix: Pre-build a Map/Set for O(1) lookup

  [HIGH]  large-import
  !! src/helpers/date.js:1  import moment (entire library: 300KB)
      fix: import { format } from 'date-fns' (tree-shakeable, 2KB)

  perf-x-ray  2 critical  |  2 high  |  0 medium  (4 total)

  Top files:
    src/services/orders.js  — 2 issues
    src/api/upload.js       — 1 issue
    src/utils/matcher.js    — 1 issue
```

---

## Commands

```bash
npx perf-x-ray scan              # scan current directory (default)
npx perf-x-ray scan ./src        # scan a specific path
npx perf-x-ray check server.js   # check a single file
npx perf-x-ray report > perf.md  # markdown report for PRs
npx perf-x-ray rules             # list all built-in rules
```

### Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `--severity` | low \| medium \| high \| critical | low | Minimum severity to show |
| `--format` | text \| json \| markdown | text | Output format |
| `--ignore` | comma-separated | — | Extra dirs/files to skip |
| `--fix` | flag | false | Show fix suggestions inline |
| `--output` | file path | perf-xray-report.md | Report output path |

---

## Built-in rules

| Rule | Severity | What it catches |
|------|----------|----------------|
| `sync-io` | Critical | `readFileSync`, `writeFileSync` in async context |
| `n-plus-one` | Critical | Database queries inside loops |
| `blocking-regex` | Critical | ReDoS-vulnerable regex with nested quantifiers |
| `unbounded-query` | Critical | `SELECT` without `LIMIT` / `TOP` |
| `nested-loops` | High | O(n²) iteration — nested `.forEach`, `.map`, `.filter` |
| `large-import` | High | Full lodash/moment imports instead of subpaths |
| `no-pagination` | High | API endpoints missing pagination |
| `missing-memo` | High | React components without `memo` / `useMemo` |
| `console-in-prod` | Medium | `console.log` left in production code |
| `missing-index-hint` | Low | SQL `WHERE` on likely unindexed columns |

Supports **JavaScript, TypeScript, Python, Go, and SQL**.

---

## Use in CI

Exits with code `1` when findings exist, `0` when clean. Drop it into any pipeline:

```yaml
# .github/workflows/perf.yml
name: Perf X-Ray

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run perf-x-ray
        run: npx perf-x-ray scan ./src --severity critical
        # Fails the build on any critical perf issue
```

For a full report as a build artifact:

```yaml
- run: npx perf-x-ray report ./src --output perf-report.md
- uses: actions/upload-artifact@v4
  with:
    name: perf-report
    path: perf-report.md
```

---

## Why not Lighthouse?

Lighthouse measures symptoms. perf-x-ray finds causes.

It runs in 200ms, works offline without a browser, and catches the code patterns that create slow apps before any user ever sees them.

---

## Programmatic API

```js
import { walkFiles, checkFiles, formatFindings } from 'perf-x-ray';
import { readFileSync } from 'fs';

const files  = walkFiles('./src');
const findings = checkFiles(files, (fp) => readFileSync(fp, 'utf8'));
const output = formatFindings(findings, 'json');

console.log(output);
```

---

## Features

- **Zero config** — works out of the box, no setup required
- **Zero API keys** — fully offline, pure static analysis
- **Multi-language** — JavaScript, TypeScript, Python, Go, SQL
- **CI-friendly** — exit code 1 on findings, 0 when clean
- **Three output formats** — colored text, JSON, Markdown
- **Smart file walker** — auto-skips `node_modules`, `dist`, `.git`, `__pycache__`, `vendor`

---

## License

MIT — built by [@NickCirv](https://github.com/NickCirv)
