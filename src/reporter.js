import chalk from 'chalk';

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

const SEVERITY_COLOR = {
  critical: chalk.bgRed.white.bold,
  high: chalk.red.bold,
  medium: chalk.yellow.bold,
  low: chalk.dim,
};

const SEVERITY_ICON = {
  critical: '!!!',
  high: '!!',
  medium: '!',
  low: 'i',
};

const ACCENT = chalk.hex('#3B82F6');

/**
 * Format findings as text (default), JSON, or Markdown.
 *
 * @param {import('./checker.js').Finding[]} findings
 * @param {'text'|'json'|'markdown'} format
 * @returns {string}
 */
export function formatFindings(findings, format = 'text') {
  if (format === 'json') return JSON.stringify(findings, null, 2);
  if (format === 'markdown') return buildMarkdown(findings);
  return buildText(findings);
}

/**
 * Print a concise summary table to stdout.
 *
 * @param {import('./checker.js').Finding[]} findings
 */
export function printSummary(findings) {
  const total = findings.length;
  if (total === 0) {
    process.stdout.write(chalk.green.bold('\n  No performance issues found.\n\n'));
    return;
  }

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;

  const line = [
    SEVERITY_COLOR.critical(`${counts.critical} critical`),
    SEVERITY_COLOR.high(`${counts.high} high`),
    SEVERITY_COLOR.medium(`${counts.medium} medium`),
    SEVERITY_COLOR.low(`${counts.low} low`),
  ].join(chalk.dim('  |  '));

  process.stdout.write(`\n  ${ACCENT.bold('perf-x-ray')}  ${line}  ${chalk.dim(`(${total} total)`)}\n`);

  // Top 5 worst files
  const fileCounts = {};
  for (const f of findings) fileCounts[f.file] = (fileCounts[f.file] ?? 0) + 1;
  const topFiles = Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topFiles.length) {
    process.stdout.write(`\n  ${chalk.dim('Top files:')}\n`);
    for (const [file, count] of topFiles) {
      process.stdout.write(`    ${chalk.dim(file)}  ${chalk.yellow(count + ' issues')}\n`);
    }
  }
  process.stdout.write('\n');
}

/**
 * Generate a full Markdown report string.
 *
 * @param {import('./checker.js').Finding[]} findings
 * @returns {string}
 */
export function generateReport(findings) {
  return buildMarkdown(findings);
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function buildText(findings) {
  if (findings.length === 0) return chalk.green('  No issues found.');

  const grouped = groupBySeverity(findings);
  const parts = [];

  for (const sev of SEVERITY_ORDER) {
    const group = grouped[sev] ?? [];
    if (!group.length) continue;

    const header = SEVERITY_COLOR[sev](`\n  [${sev.toUpperCase()}]  ${group.length} issue${group.length !== 1 ? 's' : ''}`);
    parts.push(header);

    for (const f of group) {
      const loc = chalk.dim(`${f.file}:${f.line}`);
      const icon = SEVERITY_ICON[sev] ?? '!';
      const label = ACCENT(`[${f.ruleId}]`);
      parts.push(`  ${icon} ${loc}  ${label}  ${f.message}`);
      if (f.snippet) parts.push(`      ${chalk.dim('>')} ${chalk.italic(f.snippet)}`);
      parts.push(`      ${chalk.dim('fix:')} ${f.suggestion}`);
      parts.push('');
    }
  }

  return parts.join('\n');
}

function buildMarkdown(findings) {
  const lines = ['# perf-x-ray Report\n'];
  const total = findings.length;

  if (total === 0) {
    lines.push('No performance issues found. ');
    return lines.join('\n');
  }

  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;

  lines.push('## Summary\n');
  lines.push(`| Severity | Count |`);
  lines.push(`|----------|-------|`);
  for (const sev of SEVERITY_ORDER) {
    lines.push(`| ${sev} | ${counts[sev] ?? 0} |`);
  }
  lines.push(`| **Total** | **${total}** |`);
  lines.push('');

  // Top 5 files
  const fileCounts = {};
  for (const f of findings) fileCounts[f.file] = (fileCounts[f.file] ?? 0) + 1;
  const topFiles = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topFiles.length) {
    lines.push('## Top Files\n');
    for (const [file, count] of topFiles) {
      lines.push(`- \`${file}\` — ${count} issues`);
    }
    lines.push('');
  }

  const grouped = groupBySeverity(findings);
  lines.push('## Findings\n');

  for (const sev of SEVERITY_ORDER) {
    const group = grouped[sev] ?? [];
    if (!group.length) continue;
    lines.push(`### ${sev.charAt(0).toUpperCase() + sev.slice(1)}\n`);
    for (const f of group) {
      lines.push(`**${f.ruleName}** \`${f.ruleId}\``);
      lines.push(`- **File:** \`${f.file}:${f.line}\``);
      lines.push(`- **Issue:** ${f.message}`);
      if (f.snippet) lines.push(`- **Code:** \`${f.snippet}\``);
      lines.push(`- **Fix:** ${f.suggestion}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function groupBySeverity(findings) {
  const groups = {};
  for (const f of findings) {
    (groups[f.severity] = groups[f.severity] ?? []).push(f);
  }
  return groups;
}
