# Foundry Runtime Testing

Use this playbook when changing the Foundry devcontainer, Testcontainers runtime,
package bootstrap, page objects, or browser smoke tests.

## Ownership Boundary

Treat Foundry VTT, ImpMal, and required support modules as test fixtures. Do not add
tests for their UI, data models, or business behavior unless this repository modifies
that behavior.

Use the shared bootstrap to verify fixture preconditions once:

- exact Foundry VTT, ImpMal, and remote module versions;
- the disposable world ID and ImpMal system ID;
- required module activation;
- the configured world language.

Use the Playwright project only for behavior owned by this repository:

- the local translation module is present at the locally built version and active;
- localization keys resolve through the Polish module;
- patched templates are registered under the names consumed by ImpMal and render the
  translated result;
- patched scripts or other runtime overrides expose the translated behavior;
- new module runtime features work at their public integration point.

Do not repeat fixture assertions in each smoke test. Add a test only when its failure
would identify a regression that this repository is responsible for fixing.

## Browser Errors

Collect every browser page error and console error as a diagnostic attachment. Fail
the suite automatically only for errors attributable to the local translation module,
such as errors whose stack or source URL points to its module directory or bundle.
Treat an explicit `IMPMAL-PL Failed` log as a failure even when it was emitted at a
non-error console level. Apply this monitor during setup and normal browser tests.

Do not maintain exact-message allowlists for upstream errors. An upstream error should
fail the suite only when it prevents fixture setup or breaks the module behavior under
test.

## Test Structure

Keep responsibilities separated:

| Path | Responsibility |
|------|----------------|
| `tests/foundry/bootstrap/` | Build, start the selected runtime, create the world, and seed fixtures |
| `tests/foundry/fixtures.ts` | Open the prepared world and collect module-attributable browser errors |
| `tests/foundry/specs/<domain>/` | Store executable checks grouped by product domain |
| `tests/foundry/licensed/` | Reserve tests that require paid ImpMal modules |
| `tests/foundry/pages/` | Store selectors and reusable browser actions |
| `**/__tests__/` | Store adjacent Vitest tests for Foundry-independent project code |
| `.devcontainer/managed/` | Install and validate Foundry packages |

In page objects, expose locators as public lazy functions based on `this.page`. Put
reusable actions in public methods. Keep assertions in setup or test files so failures
state the expected behavior. Prefer stable structure, IDs, classes, and `data-*`
attributes over localized text when locating elements. Put expected Polish text in the
test assertion so the behavior under test is visible in the spec. Use text to locate an
element only when the rendered UI provides no stable structural selector.

Bootstrap creates deterministic seed documents for each domain. Treat every seed as
immutable. A test must clone its seed, modify only the clone, and delete the clone in a
`finally` block. Never reuse a mutated actor, item, effect, or embedded document across
tests.

Organize Playwright specs by product domain, such as `character`, `effects`, `patches`,
`theme`, or `vehicles`. Keep programmatic and UI checks for the same domain together.
Do not create broad `runtime.spec.ts` or `ui.spec.ts` files. When the required behavior
is presentation in Foundry, prefer a direct UI assertion instead of duplicating it with
a lower-level runtime assertion.

Use Vitest for standalone project code that does not need Foundry. Place these tests in
an adjacent `__tests__` directory. Do not unit-test Playwright helpers or page objects;
exercise them through the live suite. Do not import test files from production entry
points, and verify that no test code is emitted into `dist`.

## Runtime Profiles

The Playwright configuration implements one runnable project named `base`. It runs the
tests under `tests/foundry/specs` against the public ImpMal system and support modules
installed by the shared bootstrap.

Playwright always runs on the host. Its global setup selects the runtime through
`FOUNDRY_TEST_RUNTIME`:

- `testcontainer` is the default. It creates temporary data, starts Foundry through
  Testcontainers, and removes both after the suite.
- `devcontainer` targets the persistent development Foundry service and leaves it
  running after the suite.

Both modes require `FOUNDRY_LICENSE_KEY`. Pass it to the container without writing it
to tracked configuration or logs. Use a stable container hostname and let the shared
browser bootstrap accept the EULA when required.

Log each runtime, package, world-bootstrap, and teardown stage from the test bootstrap.
Do not stream the Foundry container output during normal runs. Never print the license
key or other credentials. Run the isolated container as the host UID and GID so its
temporary bind-mounted data and cache directories remain writable.

The base profile must not depend on paid module content. It may test:

- module activation and Polish localization;
- registered template and script patches;
- runtime overrides and patched behavior available in the public system;
- public character, patron, NPC, item, effect, chat, theme, and vehicle UI.

Keep paid content tests under `tests/foundry/licensed`. That directory is reserved only;
there is no licensed Playwright project or automated licensed-module installation yet.
Do not add access keys, manifest URLs, or package downloads to the base bootstrap.

When the licensed profile is implemented later:

1. Install paid modules manually through Foundry Setup so they persist in
   `.foundry/data`.
2. Add an explicit Playwright project whose test match includes only
   `tests/foundry/licensed`.
3. Make that project opt-in and fail clearly when its required modules are missing.
4. Reuse the base setup and page objects where possible, but keep paid fixtures and
   assertions out of the base profile.

## Validation

Run all Foundry-independent unit tests:

```bash
npm test
```

Type-check the browser suite:

```bash
npm run typecheck:foundry
```

Build the current module:

```bash
npm run build
```

Run host Playwright against an isolated Foundry instance:

```bash
npm run test:foundry
```

Run the same suite against the persistent development instance when required:

```bash
npm run test:foundry:devcontainer
```

Run the repository lint command:

```bash
npx eslint .
```

Finish with:

```bash
git diff --check
```

The change is ready for review when managed tests and type-check pass, the build
succeeds, the isolated suite proves the local module behavior, and the persistent mode
also bootstraps successfully when runtime infrastructure changed.

## Related Documentation

- [Foundry V14 Development and Testing](../foundry-v14-development-and-testing.md) - Human setup and command reference
- [Repository Guidelines](repository-guidelines.md) - Repository-wide validation rules
- [Tool Development](tool-development.md) - Development tool design and network rules
