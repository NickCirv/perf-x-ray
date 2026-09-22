# Command reference

Use `node bin/xray.js` from the pinned source checkout described in the [README](../README.md). The entries below describe the inspected implementation.

| Command or argument | Behavior |
| --- | --- |
| `scan [path]` | Scan supported files; defaults to the current directory. |
| `check FILE` | Check one source file. |
| `report [path]` | Generate a Markdown report and write it to a file. |
| `rules` | List implemented detection rules. |
| `-s, --severity LEVEL` | Filter at low, medium, high or critical; defaults to low. |
| `-f, --format TYPE` | Choose text, json or markdown for scan/check. |
| `-i, --ignore PATTERNS` | Supply comma-separated exclusion patterns for scan/report. |
| `--fix` | Include suggested fixes in scan/check output; source files are not edited. |
| `-o, --output FILE` | Set the report destination; defaults to perf-xray-report.md. |
| `Exit codes` | Scan/check exit 1 for reported findings, 0 for none; check exits 2 if its input cannot be read. |

For prerequisites, file writes, external services and known limitations, see [Behavior and limits](../README.md#behavior-and-limits).

Implementation: [bin/xray.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/bin/xray.js), [src/rules.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/rules.js), [src/checker.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/checker.js); [review evidence](RESEARCH.md).
