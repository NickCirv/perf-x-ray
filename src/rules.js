/**
 * Performance anti-pattern rules.
 * Each rule: { id, name, severity, languages, pattern, message, suggestion }
 */

export const RULES = [
  {
    id: 'sync-io',
    name: 'Synchronous I/O in Async Context',
    severity: 'high',
    languages: ['js', 'ts'],
    pattern: /\b(readFileSync|writeFileSync|appendFileSync|existsSync|mkdirSync|readdirSync|statSync|unlinkSync|renameSync|copyFileSync)\b/g,
    message: 'Synchronous filesystem call blocks the event loop.',
    suggestion: 'Replace with the async equivalent (e.g. fs.promises.readFile, readdir). Use await inside an async function.',
  },
  {
    id: 'n-plus-one',
    name: 'N+1 Query Pattern',
    severity: 'critical',
    languages: ['js', 'ts', 'py', 'go'],
    pattern: /for[\s\S]{0,60}(query|findOne|findAll|find\(|select\(|\.get\(|\.fetch\(|db\.|prisma\.|orm\.)/g,
    message: 'Database query inside a loop causes N+1 queries — each iteration hits the DB.',
    suggestion: 'Batch the IDs, fetch once outside the loop (e.g. findMany({ where: { id: { in: ids } } })), then map results.',
  },
  {
    id: 'unbounded-query',
    name: 'Unbounded SQL Query',
    severity: 'high',
    languages: ['js', 'ts', 'py', 'go', 'sql'],
    pattern: /SELECT\s+[\w\s,*]+FROM\s+\w+(?!\s*WHERE[\s\S]*LIMIT|\s*LIMIT)/gi,
    message: 'SELECT without LIMIT can return millions of rows and exhaust memory.',
    suggestion: 'Always add a LIMIT clause or paginate results. For reports, stream the result set.',
  },
  {
    id: 'large-import',
    name: 'Large Barrel Import',
    severity: 'medium',
    languages: ['js', 'ts'],
    pattern: /import\s+\w+\s+from\s+['"](?:lodash|moment|ramda|rxjs|antd|@mui\/material|date-fns)['"];?/g,
    message: 'Importing the entire library pulls in megabytes of unused code.',
    suggestion: 'Use subpath imports: import debounce from "lodash/debounce" or import { debounce } from "lodash-es".',
  },
  {
    id: 'missing-memo',
    name: 'Expensive React Render Without Memoisation',
    severity: 'medium',
    languages: ['js', 'ts'],
    pattern: /(?:export\s+(?:default\s+)?function|const\s+\w+\s*=\s*(?:\([\s\S]*?\)|[\w]+)\s*=>)\s*[\s\S]{0,400}return\s*\([\s\S]{0,600}\<[\w.]+/g,
    message: 'Large component re-renders on every parent update without memoisation.',
    suggestion: 'Wrap with React.memo() for components or useMemo()/useCallback() for expensive values/handlers.',
  },
  {
    id: 'console-in-prod',
    name: 'console.log in Production Code',
    severity: 'low',
    languages: ['js', 'ts'],
    pattern: /console\.(log|warn|error|info|debug|trace)\(/g,
    message: 'console calls add overhead and leak information in production.',
    suggestion: 'Remove debug logs or replace with a structured logger (pino, winston) that respects LOG_LEVEL.',
  },
  {
    id: 'nested-loops',
    name: 'Nested Iteration — O(n²) Complexity',
    severity: 'high',
    languages: ['js', 'ts', 'py', 'go'],
    pattern: /(?:for|\.forEach|\.map|\.filter|\.reduce)\s*[\s\S]{0,200}(?:for|\.forEach|\.map|\.filter|\.reduce)/g,
    message: 'Nested loops over arrays create O(n²) complexity — devastating at scale.',
    suggestion: 'Flatten with a Map/Set for O(n) lookup, or restructure data before iteration.',
  },
  {
    id: 'no-pagination',
    name: 'API Endpoint Without Pagination',
    severity: 'high',
    languages: ['js', 'ts', 'py'],
    pattern: /(?:app|router)\.(get|post)\s*\(['"]\/\w[\w/]*['"]\s*,[\s\S]{0,600}(?:find|findAll|select|query|aggregate)\s*\((?![\s\S]{0,100}(?:limit|take|page|offset|skip))/g,
    message: 'API returns all records with no pagination — response grows unbounded with data.',
    suggestion: 'Accept ?page=&limit= query params, add LIMIT/OFFSET (or cursor-based pagination) to every list endpoint.',
  },
  {
    id: 'blocking-regex',
    name: 'Catastrophic Regex Backtracking',
    severity: 'critical',
    languages: ['js', 'ts', 'py', 'go'],
    pattern: /\/(?:[^/\\]|\\.)*(?:\+|\*|\{[^}]+\})(?:[^/\\]|\\.)*(?:\+|\*|\{[^}]+\})(?:[^/\\]|\\.)*\//g,
    message: 'Regex with nested quantifiers can backtrack exponentially on crafted input (ReDoS).',
    suggestion: 'Rewrite using atomic groups or possessive quantifiers. Test with redos-detector or safe-regex.',
  },
  {
    id: 'missing-index-hint',
    name: 'Filter on Likely Unindexed Column',
    severity: 'medium',
    languages: ['js', 'ts', 'py', 'go', 'sql'],
    pattern: /WHERE\s+(?!id\b|_id\b|pk\b|uuid\b)(\w+)\s*(?:=|LIKE|IN|>|<)/gi,
    message: 'Filtering on a column that is probably not indexed causes a full table scan.',
    suggestion: 'Add a database index on the filtered column: CREATE INDEX idx_table_column ON table(column).',
  },
];

/**
 * @param {string} lang - file extension without dot
 * @returns {import('./rules.js').Rule[]}
 */
export function getRulesForLanguage(lang) {
  return RULES.filter((r) => r.languages.includes(lang));
}
