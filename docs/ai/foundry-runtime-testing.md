# Foundry Runtime Testing

Use this playbook when changing the Foundry devcontainer, package bootstrap, page
objects, or browser smoke tests.

## Ownership Boundary

Treat Foundry VTT, ImpMal, and required support modules as test fixtures. Do not add
tests for their UI, data models, or business behavior unless this repository modifies
that behavior.

Use the setup project to verify fixture preconditions once:

- exact Foundry VTT, ImpMal, and remote module versions;
- the disposable world ID and ImpMal system ID;
- required module activation;
- the configured world language.

Use the smoke-test project only for behavior owned by this repository:

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

Do not maintain exact-message allowlists for upstream errors. An upstream error should
fail the suite only when it prevents fixture setup or breaks the module behavior under
test.

## Test Structure

Keep responsibilities separated:

| Path | Responsibility |
|------|----------------|
| `tests/foundry/setup/` | Verify the configured fixture and create the disposable world |
| `tests/foundry/fixtures.ts` | Open the prepared world and collect module-attributable browser errors |
| `tests/foundry/smoke.spec.ts` | Assert installation and runtime behavior owned by this module |
| `tests/foundry/pages/` | Store selectors and reusable browser actions |
| `.devcontainer/managed/` | Implement reusable bootstrap and runtime support |

In page objects, expose locators as public lazy functions based on `this.page`. Put
reusable actions in public methods. Keep assertions in setup or test files so failures
state the expected behavior.

## Validation

Run the managed runtime unit tests:

```bash
npm run test:devcontainer
```

Type-check the browser suite:

```bash
npm run typecheck:foundry
```

Build the current module:

```bash
npm run build
```

Run the disposable smoke-test container against the persistent Foundry instance:

```bash
npm run test:foundry:docker
```

Attempt the repository lint command and report its known loader blocker if it remains:

```bash
npx eslint .
```

Finish with:

```bash
git diff --check
```

The change is ready for review when managed tests and type-check pass, the build
succeeds, the live smoke suite proves the local module behavior, and Foundry remains
available for later test runs.

## Related Documentation

- [Foundry V14 Devcontainer](../foundry-v14-devcontainer.md) - Human setup and command reference
- [Repository Guidelines](repository-guidelines.md) - Repository-wide validation rules
- [Tool Development](tool-development.md) - Development tool design and network rules
