// Barrel re-exports — import from here for programmatic use

export { walkFiles, getLanguage } from './scanner.js';
export { RULES, getRulesForLanguage } from './rules.js';
export { checkFile, checkFiles } from './checker.js';
export { formatFindings, generateReport, printSummary } from './reporter.js';
