# oes-tooling

Reference tooling for [OES (Open Education Standards)](https://github.com/inklyre/oes) —
types, schema validation, reference resolution, referential-integrity
linting, and content importers, all built on the spec defined in the
[`oes`](https://github.com/inklyre/oes) repo.

This repo is licensed under [Apache 2.0](./LICENSE) — separate from the
spec repo, which dedicates the specifications themselves (schemas, docs)
to the public domain under CC0 1.0. See `oes`'s README for the reasoning
behind keeping the spec and its reference tooling in separate repos.

## Packages

| Package | What it is |
|---|---|
| [`packages/core`](./packages/core) — [`@inklyre/oes-core`](https://www.npmjs.com/package/@inklyre/oes-core) | Types, `validate()`, and `resolve()` for every OES document type. Everything else here builds on this. |
| [`packages/lint`](./packages/lint) — [`@inklyre/oes-lint`](https://www.npmjs.com/package/@inklyre/oes-lint) | Cross-file referential-integrity linting (dangling references, duplicate ids, `content_hash` mismatches, and more), plus the `oes` CLI. |
| [`packages/import-youtube`](./packages/import-youtube) — [`@inklyre/oes-import-youtube`](https://www.npmjs.com/package/@inklyre/oes-import-youtube) | Converts a YouTube playlist into OES content (an OCF module + one lesson per video, OVF video lessons) via the YouTube Data API. Wired into the `oes` CLI's `import youtube` subcommand. |

`packages/core` depends on [`@inklyre/oes-schemas`](https://www.npmjs.com/package/@inklyre/oes-schemas),
published from the `oes` spec repo and auto-bumped here via Dependabot —
a spec change reaches this repo as a normal dependency update, not a
manual sync step.

## Getting started

```bash
npm install
npm run build --workspaces
npm run test --workspaces
```

## CLI

```bash
npx oes lint ./my-course
npx oes import youtube "https://www.youtube.com/playlist?list=..." --api-key <key>
```

See each package's own README for details.
