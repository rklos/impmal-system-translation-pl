# Foundry V14 Devcontainer

The devcontainer runs this project against an isolated Foundry VTT 14 instance. It installs the pinned ImpMal system and support modules, links the local translation build, creates a disposable Polish test world, and runs browser smoke tests.

The setup is local to this repository. The reusable runtime files are grouped under `.devcontainer/managed` so they can be evaluated for the shared generator later.

## Requirements

- Docker with Docker Compose
- A Dev Containers compatible editor
- A licensed Foundry VTT Node.js archive for version 14.365
- Network access to pull the container image and public Foundry packages

Download the Node.js archive from your Foundry account and save it as:

```text
.foundry/cache/foundryvtt-14.365.zip
```

The `.foundry` directory is ignored by Git and excluded from the Docker build context. Do not commit or redistribute the archive.

Container dependencies use a named Docker volume at `/workspace/node_modules`. Opening the devcontainer does not replace dependencies installed on the host.

The Foundry runtime uses the exact `docker.io/felddy/foundryvtt:14.365.0` image from Docker Hub. It reads the pre-downloaded archive from `.foundry/cache`, so Foundry account credentials are not required by the container.

## Start the environment

1. Place the exact Foundry archive at the path above.
2. Reopen the repository in the devcontainer.
3. Wait for `npm ci` and `npm run build` to finish.
4. Open `http://localhost:30000`.
5. On the first run, activate Foundry and accept the EULA.

The Foundry data directory persists under `.foundry/data`. License activation and test data therefore survive container rebuilds.

The Dev Container initialization hook creates `.foundry/cache` and `.foundry/data` on the host before Compose starts. This prevents Docker from creating the bind directories with root ownership on native Linux.

The workspace installs dependencies and builds `dist` before a one-shot package bootstrap service installs these exact packages from their release manifests:

| Package | Version |
|---------|---------|
| Foundry VTT | 14.365 |
| Imperium Maledictum | 4.0.1 |
| Warhammer Library | 3.3.2 |
| libWrapper | 1.13.5.1 |
| Babele | 2.9.1 |
| Polish translation | Current local build |

The bootstrap rejects a manifest when its package ID or version does not match the configuration. It links `dist` as the translation module, so rebuilding the project updates the files used by Foundry. Foundry starts only after the bootstrap exits successfully.

The package bootstrap and Foundry services use the same pinned image and run with the same user ID. Files written to `.foundry/data` therefore remain accessible to Foundry.

## Run the checks

Run the managed runtime unit tests:

```bash
npm run test:devcontainer
```

Type-check the browser test suite:

```bash
npm run typecheck:foundry
```

From a host terminal, start a disposable container that runs the complete Foundry smoke test:

```bash
npm run test:foundry:docker
```

The Dev Container starts Foundry automatically but does not run the smoke tests. The smoke-test container waits for Foundry to become healthy, prints the Playwright log, and removes itself when the tests finish. Foundry and the interactive workspace keep running, so later smoke-test runs reuse the same Foundry instance.

To investigate a test from inside the Dev Container, run `npm run test:foundry` directly.

The test suite has an explicit ownership boundary. Foundry VTT, ImpMal, and support
modules are test fixtures. The setup project verifies their configured versions,
creates a disposable world, activates the required modules, and selects Polish. These
checks confirm that the expected fixture is ready. They do not retest upstream
features.

The smoke-test project then verifies behavior owned by this repository:

1. The current local translation build is installed with the expected version and is active.
2. An ImpMal language key resolves to its Polish translation.
3. A patched template is registered under the alias used by ImpMal and renders Polish text.
4. A patched ImpMal effect script contains the translated content.

All browser page errors and console errors are attached to the Playwright results for
diagnosis. The suite fails automatically only when an error is attributable to the
Polish translation module. Upstream errors still fail a test when they prevent fixture
setup or the module behavior under test.

Use Playwright UI mode when investigating a browser failure:

```bash
npm run test:foundry:ui
```

Reports and traces are written to ignored `playwright-report` and `test-results` directories, including when the disposable container has been removed.

## Admin password

The isolated instance uses the test-only administrator password `impmal-test-admin`. The same value is supplied to Foundry and the Playwright containers from `.devcontainer/compose.yaml`.

This fixed password is acceptable only because the instance listens on localhost and contains disposable test data. Do not reuse it for another Foundry instance.

## Configuration and updates

Pinned package versions, manifest URLs, and the disposable world ID are defined in `.devcontainer/foundry-test.config.json`. The exact felddy image reference and Foundry runtime version are defined in `.devcontainer/compose.yaml`. The required archive name is derived from `FOUNDRY_VERSION`.

When updating Foundry or an installed package:

1. Verify the new stable release and its official manifest URL.
2. For a Foundry update, verify the matching exact felddy image tag.
3. Update both felddy image references and `FOUNDRY_VERSION` in `.devcontainer/compose.yaml`.
4. Update the exact version and manifest URL in `.devcontainer/foundry-test.config.json`.
5. Replace the licensed Foundry archive when its version changes.
6. Rebuild the devcontainer.
7. Run the unit tests, type-check, project build, and Foundry smoke tests.

The package installer caches downloaded release archives in `.foundry/cache/packages`. It validates the installed manifest before reusing a package, so a version change triggers a clean install of that exact package directory.

## Rollback

Keep a copy of `.foundry/data` before testing a new Foundry major or minor version.

To roll back the runtime:

1. Stop the devcontainer.
2. Restore the previous exact felddy image reference and `FOUNDRY_VERSION`.
3. Restore the matching licensed Foundry archive and package versions.
4. Restore the saved `.foundry/data` directory if Foundry migrated its contents.
5. Rebuild and rerun the smoke tests.

Do not open migrated data with an older Foundry version unless the corresponding data copy has been restored.

## Troubleshooting

### Foundry archive not found

Confirm that the file name and location exactly match `.foundry/cache/foundryvtt-14.365.zip`.

The felddy entrypoint should report that it is using `/data/container_cache`. If it asks for credentials, the archive is missing or its file name does not match `FOUNDRY_VERSION`.

### Foundry is not activated

Open `http://localhost:30000`, finish license activation and the EULA screens, then rerun `npm run test:foundry:docker`.

### Package version mismatch

Check `.devcontainer/foundry-test.config.json`. The manifest URL and expected version must refer to the same release.

### Local translation build is missing

Run `npm run build`. The package bootstrap waits for `dist/module.json` before linking the local module.

### Test world cannot be replaced

The automated cleanup intentionally refuses to delete a world whose ID does not end in `-test`. Keep test world IDs separate from any real campaign data.

## Related documentation

- [Documentation Hub](README.md)
- [Package Development](package-development.md)
