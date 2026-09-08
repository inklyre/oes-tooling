# Fixtures

A copy of the [`oes`](https://github.com/inklyre/oes) spec repo's `conformance/`
directory, as of the `oes`/`oes-tooling` repo split. **Not live-synced** —
if new conformance fixtures are added to the spec repo later, they need to
be manually copied here too, or (the better long-term fix, already on the
roadmap as `06-tooling-roadmap.md`'s Layer 5) `oes` publishes
`conformance/` as its own installable `@inklyre/oes-conformance-fixtures`
package, the same way `schemas/` became `@inklyre/oes-schemas`, and this
directory goes away in favor of a real dependency.
