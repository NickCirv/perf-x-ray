# Source review — perf-x-ray

## Revision and method

Inspected public commit: [`aa92ada0849b48b472a95c524341d92e136e78be`](https://github.com/NickCirv/perf-x-ray/commit/aa92ada0849b48b472a95c524341d92e136e78be). Source tree: `136b05e81652ae87e3121868c63d28d5f4f9d9c4`. Capture scope: all eligible text files; 11 of 11 eligible files.

This review read captured implementation and documentation. It did not install dependencies, execute project commands, call project APIs, check package publication or establish live CI status. Examples are source-derived, not captured execution transcripts.

## Claim ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Commands, filters, report writes and exit codes | [bin/xray.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/bin/xray.js) | Verified in inspected source; execution unverified |
| Regex rule catalog | [src/rules.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/rules.js) | Verified in inspected source; execution unverified |
| File checking and line calculation | [src/checker.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/checker.js) | Verified in inspected source; execution unverified |

## Findings and verification gaps

A matched synchronous call or loop is not proof of a bottleneck. The checks do not execute code, use a browser or capture traces; false positives and missed cases are expected. Measure a suspected problem before changing implementation.

The captured smoke test only asks Node to syntax-check the entrypoint. It does not exercise behavior, integrations or failure paths. Neither that test nor installation was run in this review.

| Dimension | Result |
| --- | --- |
| Purpose and documented commands | Partially verified: static source inspection |
| Clean installation and examples | Unverified |
| Test suite and live CI | Unverified |
| Performance and security guarantees | Unverified |
| Publication | Local documentation only |

## Documentation inventory

- [README.md](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/README.md) — Rewritten; historic section anchors retained where practical.
- [LICENSE](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/LICENSE) — protected document preserved unchanged.

## Captured source inventory

- [LICENSE](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/LICENSE) — Git blob `481c289c06c96c07330f8c7dedd847c5c07ca384`.
- [README.md](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/README.md) — Git blob `6a57735cca0ce301b5fef3a3d3c282c5859acbef`.
- [package.json](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/package.json) — Git blob `f55b1cba8e54439f85672698cd55771164fb00cd`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/.github/workflows/ci.yml) — Git blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [bin/xray.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/bin/xray.js) — Git blob `f0d05d75bbbe28ce485f4a904369f5a1e8d02869`.
- [src/checker.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/checker.js) — Git blob `f1edb1190548cd45ca75bd17ebeb34efafea147f`.
- [src/index.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/index.js) — Git blob `c6a24140be347520a12cc8a7efe385c40458e805`.
- [src/reporter.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/reporter.js) — Git blob `cba154c2af28d1ca51f12c8e3cc5af95ed828e1c`.
- [src/rules.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/rules.js) — Git blob `f856dd0a829e3e004d2ad424556d35a861812b04`.
- [src/scanner.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/src/scanner.js) — Git blob `e51e712c0c78494626506e4bd18bb8e238f0c6f3`.
- [test/smoke.test.js](https://github.com/NickCirv/perf-x-ray/blob/aa92ada0849b48b472a95c524341d92e136e78be/test/smoke.test.js) — Git blob `0310a2564cc8ed8e825589ab2fb37fa35ef18d4c`.

## Scope boundary

Capture excludes lockfiles, binary artwork, generated output, vendored dependencies and files above the acquisition size limit. The tree records their existence; no verification claim is made for omitted content. Protected documents and historical records are not replaced.

## Reference coverage

Added [command reference](REFERENCE.md) from the argument parser, command handlers and source-defined help at the pinned revision. README examples remain unexecuted.
