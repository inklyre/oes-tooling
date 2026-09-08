# oes-tooling

Reference tooling for [OES (Open Education Standards)](https://github.com/inklyre/oes) —
types, schema validation, reference resolution, referential-integrity
linting, and content importers, all built on the spec defined in the
[`oes`](https://github.com/inklyre/oes) repo.

This repo is licensed under [Apache 2.0](./LICENSE) — separate from the
spec repo, which licenses the specifications themselves (schemas, docs)
under CC BY 4.0. See `oes`'s README for the reasoning behind keeping the
spec and its reference tooling in separate repos.

## Packages

| Package | What it is |
|---|---|
| [`packages/schemas`](./packages/schemas) — [`@inklyre/oes-schemas`](https://www.npmjs.com/package/@inklyre/oes-schemas) | The JSON Schemas for OES, fetched from the `oes` spec repo and packaged for npm. |
| [`packages/core`](./packages/core) — [`@inklyre/oes-core`](https://www.npmjs.com/package/@inklyre/oes-core) | Types, `validate()`, and `resolve()` for every OES document type. Everything else here builds on this. |
| [`packages/lint`](./packages/lint) — [`@inklyre/oes-lint`](https://www.npmjs.com/package/@inklyre/oes-lint) | Cross-file referential-integrity linting (dangling references, duplicate ids, `content_hash` mismatches, and more), plus the `oes` CLI. |
| [`packages/import-youtube`](./packages/import-youtube) — [`@inklyre/oes-import-youtube`](https://www.npmjs.com/package/@inklyre/oes-import-youtube) | Converts a YouTube playlist into OES content (an OCF module + one lesson per video, OVF video lessons) via the YouTube Data API. Wired into the `oes` CLI's `import youtube` subcommand. |

`packages/schemas` is unlike the others: `oes` (the spec repo) has no
publish pipeline of its own, on purpose — publish credentials don't
belong in the repo that welcomes low-barrier outside contributions.
Instead, `.github/workflows/schemas-sync.yml` here polls `oes` on a daily
schedule and publishes a new patch of `@inklyre/oes-schemas` when its
schema content changes. `packages/core` depends on it like a normal npm
package. See `packages/schemas`'s own README for the full mechanism.

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
