#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, relative } from 'path';
import { program } from 'commander';
import chalk from 'chalk';

import { walkFiles } from '../src/scanner.js';
import { checkFile, checkFiles } from '../src/checker.js';
import { formatFindings, generateReport, printSummary } from '../src/reporter.js';
import { RULES } from '../src/rules.js';

const ACCENT = chalk.hex('#3B82F6');

// ─── Shared option helpers ────────────────────────────────────────────────────

function applyFilters(findings, { severity, fix }) {
  const severityRank = { low: 0, medium: 1, high: 2, critical: 3 };
  let result = findings;
  if (severity) {
    const min = severityRank[severity] ?? 0;
    result = result.filter((f) => (severityRank[f.severity] ?? 0) >= min);
  }
  if (fix) {
    result = result.map((f) => ({ ...f, _showFix: true }));
  }
  return result;
}

function parseIgnore(raw) {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

// ─── CLI definition ───────────────────────────────────────────────────────────

program
  .name('perf-x-ray')
  .description('X-ray your codebase for performance anti-patterns — no browser needed')
  .version('1.0.0');

// scan [path]
program
  .command('scan [path]', { isDefault: true })
  .description('Scan a directory for performance issues (default: current directory)')
  .option('-s, --severity <level>', 'Minimum severity to report: low|medium|high|critical', 'low')
  .option('-f, --format <type>', 'Output format: text|json|markdown', 'text')
  .option('-i, --ignore <patterns>', 'Comma-separated dir/file patterns to ignore')
  .option('--fix', 'Include fix suggestions in output')
  .action((scanPath, opts) => {
    const root = resolve(scanPath ?? '.');
    const ignore = parseIgnore(opts.ignore);

    process.stdout.write(`\n  ${ACCENT.bold('perf-x-ray')} scanning ${chalk.dim(root)} ...\n`);

    const files = walkFiles(root, { ignore });
    if (files.length === 0) {
      process.stdout.write(chalk.yellow('  No supported source files found.\n'));
      process.exit(0);
    }

    const findings = checkFiles(files, (fp) => readFileSync(fp, 'utf8'), { severity: opts.severity });
    const filtered = applyFilters(findings, opts);

    const output = formatFindings(filtered, opts.format);
    if (output) process.stdout.write(output + '\n');
    printSummary(filtered);

    process.exit(filtered.length > 0 ? 1 : 0);
  });

// check <file>
program
  .command('check <file>')
  .description('Check a single file for performance issues')
  .option('-s, --severity <level>', 'Minimum severity to report: low|medium|high|critical', 'low')
  .option('-f, --format <type>', 'Output format: text|json|markdown', 'text')
  .option('--fix', 'Include fix suggestions in output')
  .action((filePath, opts) => {
    const absPath = resolve(filePath);
    let content;
    try {
      content = readFileSync(absPath, 'utf8');
    } catch (err) {
      process.stderr.write(chalk.red(`  Error reading file: ${err.message}\n`));
      process.exit(2);
    }

    const findings = checkFile(absPath, content);
    const filtered = applyFilters(findings, opts);

    const output = formatFindings(filtered, opts.format);
    if (output) process.stdout.write(output + '\n');
    printSummary(filtered);

    process.exit(filtered.length > 0 ? 1 : 0);
  });

// report [path]
program
  .command('report [path]')
  .description('Generate a Markdown performance report')
  .option('-o, --output <file>', 'Write report to file (default: perf-xray-report.md)')
  .option('-s, --severity <level>', 'Minimum severity to report: low|medium|high|critical', 'low')
  .option('-i, --ignore <patterns>', 'Comma-separated dir/file patterns to ignore')
  .action((scanPath, opts) => {
    const root = resolve(scanPath ?? '.');
    const ignore = parseIgnore(opts.ignore);
    const outFile = resolve(opts.output ?? 'perf-xray-report.md');

    process.stdout.write(`\n  ${ACCENT.bold('perf-x-ray')} generating report for ${chalk.dim(root)} ...\n`);

    const files = walkFiles(root, { ignore });
    const findings = checkFiles(files, (fp) => readFileSync(fp, 'utf8'), { severity: opts.severity });

    const report = generateReport(findings);
    writeFileSync(outFile, report, 'utf8');

    printSummary(findings);
    process.stdout.write(`  ${chalk.green('Report saved:')} ${chalk.dim(outFile)}\n\n`);
  });

// rules — list all rules
program
  .command('rules')
  .description('List all available performance rules')
  .action(() => {
    process.stdout.write(`\n  ${ACCENT.bold('perf-x-ray')} rules\n\n`);
    const severityColor = { critical: chalk.red.bold, high: chalk.yellow.bold, medium: chalk.cyan, low: chalk.dim };
    for (const rule of RULES) {
      const sc = severityColor[rule.severity] ?? chalk.white;
      process.stdout.write(`  ${sc(rule.severity.padEnd(8))}  ${chalk.bold(rule.id.padEnd(22))}  ${chalk.dim(rule.languages.join(', ').padEnd(16))}  ${rule.name}\n`);
    }
    process.stdout.write('\n');
  });

program.parse();
