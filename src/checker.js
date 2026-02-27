import { getRulesForLanguage } from './rules.js';
import { getLanguage } from './scanner.js';

/**
 * @typedef {Object} Finding
 * @property {string} ruleId
 * @property {string} ruleName
 * @property {string} severity
 * @property {string} file
 * @property {number} line
 * @property {string} snippet
 * @property {string} message
 * @property {string} suggestion
 */

/**
 * Run all applicable rules against a single file's content.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {Finding[]}
 */
export function checkFile(filePath, content) {
  const lang = getLanguage(filePath);
  const rules = getRulesForLanguage(lang);
  const lines = content.split('\n');
  const findings = [];

  for (const rule of rules) {
    // Clone regex so lastIndex resets per rule
    const rx = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g');

    let match;
    while ((match = rx.exec(content)) !== null) {
      // Guard against infinite loops on zero-length matches
      if (match.index === rx.lastIndex) {
        rx.lastIndex++;
        continue;
      }

      const lineNumber = getLineNumber(content, match.index);
      const snippet = getSnippet(lines, lineNumber - 1);

      findings.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        file: filePath,
        line: lineNumber,
        snippet,
        message: rule.message,
        suggestion: rule.suggestion,
      });

      // Cap matches per rule per file to avoid noise from generated files
      const ruleHits = findings.filter((f) => f.ruleId === rule.id && f.file === filePath).length;
      if (ruleHits >= 5) break;
    }
  }

  return findings;
}

/**
 * Return the 1-based line number for a character offset in content.
 *
 * @param {string} content
 * @param {number} index
 * @returns {number}
 */
function getLineNumber(content, index) {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

/**
 * Return a trimmed, safe-length snippet for the given 0-based line index.
 *
 * @param {string[]} lines
 * @param {number} lineIdx
 * @returns {string}
 */
function getSnippet(lines, lineIdx) {
  const raw = (lines[lineIdx] ?? '').trim();
  return raw.length > 120 ? raw.slice(0, 117) + '...' : raw;
}

/**
 * Check multiple files and aggregate findings.
 *
 * @param {string[]} filePaths
 * @param {(path: string) => string} readFn - supply file content
 * @param {{ severity?: string }} opts
 * @returns {Finding[]}
 */
export function checkFiles(filePaths, readFn, opts = {}) {
  const { severity } = opts;
  const severityRank = { low: 0, medium: 1, high: 2, critical: 3 };
  const minRank = severity ? (severityRank[severity] ?? 0) : 0;

  const all = [];
  for (const fp of filePaths) {
    let content;
    try {
      content = readFn(fp);
    } catch {
      continue;
    }
    const findings = checkFile(fp, content);
    for (const f of findings) {
      if ((severityRank[f.severity] ?? 0) >= minRank) {
        all.push(f);
      }
    }
  }
  return all;
}
