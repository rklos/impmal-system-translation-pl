# Upgrade and Patch Maintenance

Use this playbook when upgrading Foundry VTT, ImpMal, WHLib, Babele, or another upstream
dependency. It covers release research, translation review, patch repair, and runtime
verification.

## Completion Criteria

An upgrade is complete only when:

- compatibility metadata names the accepted exact versions;
- language files have been synchronized and manually reviewed;
- every retained patch applies to the exact target release;
- patches that still apply have been checked for new surrounding strings;
- added and changed scripts and templates have been audited;
- removed patches have a recorded reason in the review summary;
- the build passes, and lint either passes or has an explicitly accepted infrastructure
  blocker;
- a live Foundry VTT test confirms that runtime patches take effect;
- each change group has been presented separately for review.

Patch applicability alone does not prove runtime compatibility.

## 1. Prepare the Upgrade Branch

1. Confirm the working tree is clean.
2. Update `main`.
3. Create a dedicated branch.
4. Install locked dependencies if needed.
5. Run the build before editing.

```bash
git switch main
```

```bash
git pull --ff-only
```

```bash
git switch -c codex/<upgrade-name>
```

```bash
npm ci
```

```bash
npm run build
```

Do not mix unrelated work into the upgrade branch.

## 2. Establish Exact Versions

Record the current and target versions before changing files.

| Component | Local source of current support | Upstream evidence |
|-----------|---------------------------------|-------------------|
| Foundry VTT | `src/module.json` compatibility | Current official Foundry documentation and release notes |
| ImpMal | `src/module.json` and `src/packages/impmal/index.ts` | Exact GitHub release tag and comparison |
| WHLib | `src/packages/warhammer-library/index.ts` | Exact GitHub release tag and comparison |
| Babele | `src/module.json` required-module compatibility | Exact module release |

Use Context7 for current Foundry API documentation. Use Git or GitHub CLI for exact
upstream tags, release metadata, and file comparisons.

If CLI networking is blocked, request network permission and retry. Do not replace a
headless CLI comparison with browser automation unless the task requires browser behavior.

Never compare patches against an upstream default branch when the target is a release tag.

## 3. Collect Release Changes

Run the repository report before updating supported-version values.

```bash
npm run report
```

For each upstream project:

1. Compare the current exact tag with the target exact tag.
2. Save the list of added, modified, renamed, and removed files.
3. Group changes into language JSON, scripts, templates, manifest metadata, and runtime
   APIs.
4. Inspect release notes for migrations that affect hooks, Handlebars, template loading,
   sockets, or system configuration.
5. Confirm dependency relationships between ImpMal and WHLib.

Do not rely only on release notes. Inspect the changed files.

## 4. Synchronize Language Files

Follow [Translation Maintenance](translation-maintenance.md). Keep each phase separate.

Run the WFRP4e synchronization first.

```bash
npm run sync wfrp4e
```

Review the WHLib diff before continuing.

Then synchronize upstream language structures.

```bash
npm run sync source
```

The current source sync reads the hardcoded upstream `master` ref. Verify every new key
against the exact target tag before accepting it.

Complete missing translations manually and run:

```bash
npm run build
```

Do not begin patch repair until language-file changes are understood and reviewable.

## 5. Inventory Existing Patches

List the tracked patch corpus for each package.

```bash
rg --files src/packages/impmal/patches
```

```bash
rg --files src/packages/warhammer-library/patches
```

For every patch, record:

- package;
- target path;
- script or template type;
- whether the target exists in the old release;
- whether it applies to the old release;
- whether the target exists in the new release;
- whether it applies to the new release;
- the final action.

First verify that patches apply to the previously supported exact version. A patch that
already fails against the old version is a pre-existing problem, not an upgrade regression.

## 6. Prepare Exact Patch Inputs

Use an exact tagged upstream checkout as the immutable source.

```bash
git clone --branch <target-tag> --depth 1 https://github.com/<owner>/<repository>.git <scratch-directory>
```

The current `npm run patch download` command clones upstream default branches and ignores
`SUPPORTED_VERSION`. Do not use its output as proof of exact-release compatibility.

Populate the repository's package working trees from the exact tagged source:

- `src/packages/<package>/temp/patches/en/` contains an untouched target snapshot.
- `src/packages/<package>/temp/patches/pl/` starts as an identical target snapshot and is
  modified for Polish output.

An external scratch checkout is acceptable as an immutable input. Edit translated working
files and tracked patch files in the repository. Do not prepare parallel replacement
patches in `/tmp`.

## 7. Audit Every Patch

Apply every patch against a pristine copy of its exact target file.

The current `npm run patch apply` command stops at the first missing target or failed patch
and modifies the Polish working tree before stopping. Its first error is not a complete
audit.

To obtain a complete result:

1. Start each patch from an unmodified exact target file.
2. Test patches independently, or restore the complete Polish working tree before each
   full pass.
3. Continue until every patch has a recorded result.
4. Compare the final patch count with the initial inventory.

Do not rerun all patches over files that already contain applied changes.

## 8. Classify Failures

Investigate before editing or deleting a patch.

| Classification | Evidence | Action |
|----------------|----------|--------|
| Context changed | Target still exists and the Polish text is still required | Reapply the translation to the new file and refresh the minimal diff |
| Upstream localized the text | Target now uses a language key or already provides the required result | Remove the redundant patch |
| Target renamed or moved | Equivalent current file or template exists elsewhere | Move the translation to the new target and regenerate the patch |
| Feature removed | No replacement target or runtime use exists | Remove the obsolete patch |
| Wrong source version | File does not match the target release being audited | Correct the source snapshot and repeat the audit |
| Patch was already stale | It fails against the old supported release | Report it separately, then repair or remove it with evidence |

Do not remove a patch only because automatic application failed.

## 9. Review Successful Patches

A successful patch can still be incomplete.

For every patched file changed upstream between releases:

1. Compare its old and new upstream versions.
2. Inspect new text near and outside the existing patch hunk.
3. Check whether existing English text changed meaning.
4. Check whether upstream replaced literal text with localization keys.
5. Confirm that the patch still targets the active template or script.

Record newly required translations even when the old patch applied without conflict.

## 10. Scan New and Changed Files

Review every added or modified script and template from the release comparison, including
files without an existing patch.

Look for user-facing text in:

- headings, labels, buttons, placeholders, and empty states;
- tooltips, notifications, dialogs, and confirmation prompts;
- chat-card text and roll summaries;
- dynamically constructed template strings;
- effect scripts and configuration-provided scripts;
- accessibility labels and title attributes.

Do not translate:

- internal identifiers;
- object keys and paths;
- CSS classes;
- URLs;
- localization keys;
- developer-only log messages unless users see them.

Review ImpMal and WHLib separately. A large existing WHLib script surface is not limited to
files added in the newest release.

## 11. Refresh or Remove Patches

For a patch that needs translation:

1. Restore the exact new upstream file in both English and Polish working trees.
2. Edit the Polish working file in place.
3. Preserve code, whitespace, placeholders, and line endings.
4. Generate a minimal unified diff.
5. Review the tracked `.diff` file at its repository path.
6. Apply the generated patch to a fresh upstream file.

Use the full command only when every configured package working tree is complete:

```bash
npm run patch create
```

This command removes each existing patch directory before rebuilding it. It is unsuitable
for a partial working tree. For a small refresh, update only the affected tracked patch and
leave unrelated patches untouched.

Remove a patch only after classification. Include the reason in the review summary.

## 12. Verify Runtime Compatibility

Build-time patch loading and runtime patch application are separate systems.

Check the runtime implementation for:

- APIs supported by the target Foundry version;
- awaited asynchronous template loading and registration;
- correct `systems/` or `modules/` template paths;
- named Handlebars aliases used by upstream code;
- correct package-specific script registries;
- failure paths that do not register original content or log false success.

Current repository behavior requires special care:

- template patching fetches through a socket event and registers by path;
- template work is started inside asynchronous `forEach` callbacks and is not awaited;
- script patching reads `game.impmal.config.effectScripts`;
- WHLib has no runtime initialization and cannot be assumed to apply general patches;
- a template patch path valid for an ImpMal system is not automatically valid for a WHLib
  module.

Do not add WHLib patches that have no verified runtime application path. Report the missing
mechanism separately unless the user asks to change it.

## 13. Run Final Checks

Run static validation:

```bash
npx eslint .
```

```bash
npm run build
```

```bash
git diff --check
```

The current lint command exits while loading `import/no-unresolved` with ESLint 10.0.3,
before checking project files. Record that existing blocker if it remains.

Then run a live smoke test with the exact supported versions:

1. Start Foundry VTT at the target major version.
2. Enable the target ImpMal, WHLib, Babele, and translation-module versions.
3. Open each patched actor sheet, item sheet, application, and chat card.
4. Trigger patched effect scripts and dialogs.
5. Confirm Polish text appears in the active templates.
6. Check the browser console for template, Handlebars, socket, and script errors.
7. Reload the world and repeat a representative patched flow.

If a live Foundry environment is unavailable, report runtime verification as outstanding.
Do not call the upgrade ready.

## 14. Update Compatibility Metadata

Update version declarations only after the target audit is understood:

- Foundry VTT and module relationships in `src/module.json`;
- ImpMal compatibility through `src/module.json`;
- WHLib `SUPPORTED_VERSION` in its package entry point;
- package dependencies and lock file only when the upgrade requires them.

Run the final build again after metadata changes.

## Review Sequence

Present these change groups separately:

1. Compatibility and dependency metadata
2. WFRP4e and upstream language synchronization
3. Manual language translations
4. Refreshed and removed ImpMal patches
5. New ImpMal translation patches
6. WHLib audit and any supported WHLib patches
7. Runtime patch mechanism changes, if requested
8. Documentation updates

Keep patch maintenance and newly discovered translations as separate review units. A
release version bump is also a separate operation and follows
[Release Maintenance](release-maintenance.md).

Do not commit, push, or open a pull request until the user requests that action.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CLI cannot access GitHub | Request network permission and retry the exact CLI command |
| Downloaded files do not match the release | Use an exact tagged checkout instead of the default branch |
| Patch apply stops after one failure | Restore pristine inputs and test the remaining patches independently |
| A patch applies but English remains | Review upstream changes and scan the complete target file |
| Patch create deletes most patches | Restore from Git and regenerate only from complete English and Polish trees |
| Build passes but templates remain English | Test runtime loading, template aliases, paths, and registration |
| WHLib patch builds but never runs | Verify a WHLib runtime initialization and module template path exist |
| Tool reports success after an error | Treat the phase as failed and inspect the logged package or file |
| ESLint stops before checking files | Report the `import/no-unresolved` loader failure as a validation blocker |

## Related Documentation

- [Patching System](../patching-system.md) - Patch command reference and file format
- [Translation Maintenance](translation-maintenance.md) - Language synchronization workflow
- [Tool Development](tool-development.md) - Patch tool behavior and safety
- [Repository Guidelines](repository-guidelines.md) - Standard validation and change boundaries
- [Release Maintenance](release-maintenance.md) - Version bump and publication workflow
