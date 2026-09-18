# Foundry V14 Development and Testing

This project uses two Foundry VTT runtime modes:

- A long-running Docker Compose service for interactive development.
- A temporary Testcontainers instance for isolated Playwright runs.

Playwright always runs directly on the host. It never runs in the Foundry container.

## Requirements

- Node.js and npm
- Docker with Docker Compose
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

Copy `.env.example` to `.env` in the project root and add the license key:

```dotenv
FOUNDRY_LICENSE_KEY=your-license-key
```

The local `.env` file is ignored by Git. A key set in the shell takes precedence over
the value in that file:

```bash
read -s FOUNDRY_LICENSE_KEY
export FOUNDRY_LICENSE_KEY
```

You may load the value from your normal secret manager instead. Do not add it to
the repository, Compose file, package scripts, or an environment file other than
the ignored root `.env`.

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
4. Starts the Foundry service.
5. Waits for Foundry to become ready.
6. Accepts the EULA when required.
7. Recreates the disposable Polish test world.
8. Activates the required modules and selects Polish.
9. Creates deterministic seed entities for each tested domain.

Open `http://localhost:30000` after the command finishes.

The development data persists under `.foundry/data`. Install and run project tools on
the host. Tests also run from the host.

`npm run foundry:start` resets the disposable test world every time it runs. The
Foundry container, installed packages, and package cache remain available between runs.
Use the running world for manual debugging. Start a test run to reset it back to the
seeded baseline.

If port `30000` is occupied, set `FOUNDRY_COMPOSE_PORT` in `.env` and use the same
value when opening Foundry or running Compose tests. This changes only the host port:

```bash
FOUNDRY_COMPOSE_PORT=30001 npm run foundry:start
```

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
npm run test:foundry:compose
```

The equivalent explicit toggle is:

```bash
FOUNDRY_TEST_RUNTIME=compose npm run test:foundry
```

The accepted values are `testcontainer` and `compose`. The Compose mode resets and
prepares the test world but leaves the Foundry service running after the suite.

When the Compose service is stopped, `test:foundry:compose` starts it and performs one
world bootstrap. When it is already running, the command resets the existing test world
through the same bootstrap before running Playwright.

Use Playwright UI mode when investigating a browser failure:

```bash
npm run test:foundry:ui
```

Reports and traces are written to ignored `playwright-report` and
`test-results` directories.

Bootstrap prints colored status lines for each build, package, runtime, world setup,
and teardown stage. It does not stream the Foundry container output during normal runs
or print license keys and passwords.

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

Pinned package versions, manifest URLs, and the disposable world ID are defined in
`tools/foundry/foundry-test.config.json`.

The development image and Foundry version are defined in `compose.yaml`. The
Testcontainers adapter uses the same exact image and version in
`tests/foundry/bootstrap/runtime.ts`.

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
| `FOUNDRY_LICENSE_KEY` is missing | Add the license key to the ignored root `.env`, or export it in the same shell before starting Foundry or Playwright |
| Foundry archive is missing | Place `foundryvtt-14.365.zip` under `.foundry/cache` |
| Playwright cannot launch Chromium | Run `npx playwright install chromium` |
| Isolated Foundry does not become ready | Check the bootstrap error after the last `[foundry]` stage and verify the archive, bind-mount permissions, and license key |
| A package version does not match | Check the manifest URL and exact version in `tools/foundry/foundry-test.config.json` |
| The local module is missing | Run `npm run build`, then rerun the bootstrap |
| A test changes another test's result | Confirm that it clones a seed and deletes only the clone |
| A test runtime remains after failure | Testcontainers normally removes it automatically; inspect Docker only if the host process was forcibly terminated |

## Related documentation

- [Documentation Hub](README.md)
- [Package Development](package-development.md)
