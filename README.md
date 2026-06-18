<div align="center">

# perf-x-ray

**Catch N+1 queries, sync I/O, ReDoS, and O(n²) loops before they hit production.**

[![License](https://img.shields.io/github/license/NickCirv/perf-x-ray?style=flat-square&labelColor=0B0A09)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&labelColor=0B0A09)](package.json)

</div>

## Install

```bash
npx github:NickCirv/perf-x-ray scan ./src
```

## Usage

```bash
npx github:NickCirv/perf-x-ray scan ./src          # scan a directory
npx github:NickCirv/perf-x-ray check server.js     # check a single file
npx github:NickCirv/perf-x-ray report ./src        # generate Markdown report
npx github:NickCirv/perf-x-ray rules               # list all built-in rules
```

| Flag | Description |
|------|-------------|
| `--severity low\|medium\|high\|critical` | Minimum severity to show (default: `low`) |
| `--format text\|json\|markdown` | Output format (default: `text`) |
| `--ignore <patterns>` | Comma-separated dirs/files to skip |
| `--fix` | Show fix suggestions inline |
| `--output <file>` | Report output path (default: `perf-xray-report.md`) |

## What it does

Static analysis for JavaScript, TypeScript, Python, Go, and SQL. Scans for ten performance anti-patterns — sync I/O in async handlers, N+1 database queries, ReDoS-vulnerable regexes, unbounded SQL queries, O(n²) nested loops, full lodash/moment imports, missing pagination, un-memoised React components, and more. Runs in ~200ms with no browser, no config, no API keys. Exits with code `1` when findings exist so it drops cleanly into any CI pipeline.

---
<sub>Node ≥18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
