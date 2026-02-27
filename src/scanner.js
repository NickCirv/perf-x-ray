import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'out',
  '__pycache__',
  '.venv',
  'venv',
  '.cache',
  'vendor',
]);

const SUPPORTED_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.sql', '.mjs', '.cjs']);

/**
 * Walk a directory tree and collect all supported source files.
 *
 * @param {string} rootPath - directory to scan
 * @param {{ ignore?: string[] }} opts
 * @returns {string[]} absolute file paths
 */
export function walkFiles(rootPath, opts = {}) {
  const { ignore = [] } = opts;
  const ignoredDirs = new Set([...SKIP_DIRS, ...ignore]);
  const results = [];

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.startsWith('.') && entry !== '.') continue;

      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (!ignoredDirs.has(basename(fullPath))) {
          walk(fullPath);
        }
        continue;
      }

      const ext = extname(entry).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }

  walk(rootPath);
  return results;
}

/**
 * Map a file extension to a canonical language identifier used by rules.
 *
 * @param {string} filePath
 * @returns {string}
 */
export function getLanguage(filePath) {
  const ext = extname(filePath).toLowerCase().replace('.', '');
  const map = {
    js: 'js',
    mjs: 'js',
    cjs: 'js',
    jsx: 'js',
    ts: 'ts',
    tsx: 'ts',
    py: 'py',
    go: 'go',
    sql: 'sql',
  };
  return map[ext] ?? ext;
}
