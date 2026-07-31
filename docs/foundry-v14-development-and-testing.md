# Foundry V14 Development and Testing

This project uses two Foundry VTT runtime modes:

- A long-running devcontainer for interactive development.
- A temporary Testcontainers instance for isolated Playwright runs.

Playwright always runs directly on the host. It never runs in the workspace or
Foundry containers.

## Requirements

- Node.js and npm
- Docker with Docker Compose
- A Dev Containers compatible editor for interactive container development
- A licensed Foundry VTT Node.js archive for version 14.365
- A Foundry VTT license key available through `FOUNDRY_LICENSE_KEY`
- Network access for public Foundry packages

Install the host dependencies:

```bash
npm ci
```

Install the Playwright browser once:

```bash
npx playwright install chromium
```

Download the Node.js archive from your Foundry account and save it as:

```text
.foundry/cache/foundryvtt-14.365.zip
```

The `.foundry` directory is ignored by Git. Do not commit or redistribute the
archive, license key, runtime data, or test data.

## License and EULA

Set the license key in the shell that starts the development runtime or tests:

```bash
read -s FOUNDRY_LICENSE_KEY
export FOUNDRY_LICENSE_KEY
```

You may load the value from your normal secret manager instead. Do not add it to
the repository, Compose file, package scripts, or an environment file.

The bootstrap passes `FOUNDRY_LICENSE_KEY` directly to the Foundry container. It
uses a stable hostname because Foundry binds activation to the hostname. The
browser bootstrap accepts the EULA when a new runtime displays it.

The isolated instance uses the test-only administrator password
`impmal-test-admin`. This value is safe only for the localhost test environment.

## Start the development environment

Run:

```bash
npm run foundry:start
```

The command:

1. Builds the project on the host.
2. Installs the pinned public system and modules.
3. Copies `dist` into the persistent Foundry data directory.
4. Starts the workspace and Foundry services.
5. Waits for Foundry to become ready.
6. Accepts the EULA when required.
7. Recreates the disposable Polish test world.
8. Activates the required modules and selects Polish.
9. Creates deterministic seed entities for each tested domain.

Open `http://localhost:30000` after the command finishes.

The development data persists under `.foundry/data`. The editor devcontainer
remains available for interactive commands, but tests run from the host.

## Run the checks

Run Foundry-independent Vitest tests:

```bash
npm test
```

Type-check the Playwright suite:

```bash
npm run typecheck:foundry
```

Run the isolated base profile:

```bash
npm run test:foundry
```

This is the default mode. Playwright global setup:

1. Builds the project.
2. Creates a temporary Foundry data directory.
3. Installs the exact public packages and copies `dist`.
4. Starts Foundry with Testcontainers on a random host port.
5. Accepts the EULA and creates the test world.
6. Creates the deterministic seed entities.
7. Runs the base Playwright profile.
8. Stops the container and removes its temporary data.

To run host Playwright against the long-running development instance instead:

```bash
npm run test:foundry:devcontainer
```

The equivalent explicit toggle is:

```bash
FOUNDRY_TEST_RUNTIME=devcontainer npm run test:foundry
```

The accepted values are `testcontainer` and `devcontainer`. The devcontainer
mode resets and prepares the test world but leaves the development services
running after the suite.

Use Playwright UI mode when investigating a browser failure:

```bash
npm run test:foundry:ui
```

Reports and traces are written to ignored `playwright-report` and
`test-results` directories.

## Entity isolation

Bootstrap creates immutable seed documents with deterministic IDs for the
character, NPC, patron, effects, and item domains.

Tests never modify these seeds. Each test clones the seed it needs, applies its
own setup, and deletes the clone in teardown. A test therefore cannot inherit an
actor, item, embedded document, or changed value from an earlier test.

Keep new fixtures within the same boundary:

1. Add one deterministic seed for the domain.
2. Treat the seed as read-only.
3. Clone it for each test.
4. Delete the clone in a `finally` block.

## Installed packages

The bootstrap installs these exact packages:

| Package | Version |
|---------|---------|
| Foundry VTT | 14.365 |
| Imperium Maledictum | 4.0.1 |
| Warhammer Library | 3.3.2 |
| libWrapper | 1.13.5.1 |
| Babele | 2.9.1 |
| Polish translation | Current local build |

The package installer rejects a manifest whose package ID or version does not
match the configuration. Downloaded archives are cached under
`.foundry/cache/packages`.

## Test ownership

Foundry VTT, ImpMal, and support modules are fixtures. The setup phase verifies
their versions, creates the world, activates the required modules, and selects
Polish. It does not retest upstream behavior.

The base profile verifies behavior owned by this repository:

1. The current translation module is installed and active.
2. Polish localization keys resolve.
3. Patched templates and scripts are registered.
4. Patched scripts compile in the Foundry browser runtime.
5. Polish configuration and ordering overrides are active.
6. Patched labels render in the real ImpMal UI.
7. Module-owned layout rules are applied.

`tests/foundry/licensed` remains reserved for a future opt-in profile. The base
bootstrap must not download paid ImpMal modules or store private manifest URLs.

## Configuration and updates

Pinned package versions, manifest URLs, and the disposable world ID are defined
in `.devcontainer/foundry-test.config.json`.

The development image and Foundry version are defined in
`.devcontainer/compose.yaml`. The Testcontainers adapter uses the same exact
image and version in `tests/foundry/bootstrap/runtime.ts`.

When updating Foundry or an installed package:

1. Verify the new stable release and official manifest URL.
2. Update the exact versions and URLs in the test configuration.
3. Update both Foundry image references when Foundry changes.
4. Replace the licensed Node.js archive.
5. Run unit tests, browser type-checking, the project build, and both Foundry
   runtime modes.

## Rollback

Keep a copy of `.foundry/data` before testing a new Foundry version.

To roll back:

1. Stop the development services.
2. Restore the previous image and Foundry version.
3. Restore the matching archive and package versions.
4. Restore the saved `.foundry/data` directory if Foundry migrated it.
5. Start the environment and rerun the smoke tests.

Do not open migrated data with an older Foundry version unless you restored the
matching data copy.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `FOUNDRY_LICENSE_KEY` is missing | Export the license key in the same shell before starting Foundry or Playwright |
| Foundry archive is missing | Place `foundryvtt-14.365.zip` under `.foundry/cache` |
| Playwright cannot launch Chromium | Run `npx playwright install chromium` |
| A package version does not match | Check the manifest URL and exact version in `.devcontainer/foundry-test.config.json` |
| The local module is missing | Run `npm run build`, then rerun the bootstrap |
| A test changes another test's result | Confirm that it clones a seed and deletes only the clone |
| A test runtime remains after failure | Testcontainers normally removes it automatically; inspect Docker only if the host process was forcibly terminated |

## Related documentation

- [Documentation Hub](README.md)
- [Package Development](package-development.md)
