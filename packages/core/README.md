# @inklyre/oes-core

Types, schema validation, and reference resolution for [OES](https://github.com/inklyre/oes)
(Open Education Standards) content — the foundation every other OES tool
is meant to build on rather than reimplement.

## Install

```bash
npm install @inklyre/oes-core
```

## What this does

- **Types** — hand-written TypeScript types for all 5 specs (OCF, OPF, OQF,
  OAF, OVF), kept honest against the real JSON Schemas by a test suite that
  runs every fixture in this repo's `conformance/` through this package's
  own validator (`test/conformance.test.ts`) — a schema change with no
  matching type update fails that suite.
- **Validate** — one JSON Schema validator (`ajv`) per document type.
- **Resolve** — walks a course/set's `path`/`*_url` references into one
  fully-resolved, validated tree, using a pluggable `ContentSource` so the
  exact same resolution logic runs from the local filesystem (a CLI, the
  desktop Studio app) or over HTTP (a browser LMS, the playground). Every
  reference's `content_hash`, where declared, is verified against the
  fetched content along the way — a mismatch is reported the same way a
  dangling reference is, via `ResolveError`, without failing the rest of
  the tree.

## Usage

```ts
import { validateOqfQuestion } from "@inklyre/oes-core";

const result = validateOqfQuestion(someJson);
if (result.valid) {
  // result.data is now typed as OqfQuestion, narrowed further by `type`
  console.log(result.data.title);
} else {
  console.error(result.errors);
}
```

```ts
import { fsSource, resolveCourse } from "@inklyre/oes-core";

const { data, errors } = await resolveCourse(fsSource("./my-course"));
// data: the full course → module → lesson → article/video/practice-set →
// question → stimulus tree, every document already schema-validated.
// errors: any broken reference along the way — resolution of everything
// else still completes; see ResolveError.
```

```ts
import { urlSource, resolveSet } from "@inklyre/oes-core";

// Same resolver, a URL-rooted source instead — works unchanged in a browser.
const { data, errors } = await resolveSet(
  urlSource("https://raw.githubusercontent.com/example/practice-set/main/")
);
```

## What this doesn't do

- **Referential-integrity linting beyond what `resolve` naturally checks**
  (e.g. duplicate `id`s across a whole tree, `answer_key` file existence
  independent of whether anything currently references it, `match`/`order`
  answer cross-references, pool `select` ≤ `from.length`) — that's
  [`@inklyre/oes-lint`](../lint), not this package. `resolve` only reports
  references it actually walked.
- **Rendering** — turning resolved content into UI is `@oes/renderer`'s
  job (planned), not this package's.
- **Progress, grading, or any runtime state** — deliberately out of scope
  for OES itself; see the Versioning & Conformance page's "Scope: content,
  not runtime state" section.
