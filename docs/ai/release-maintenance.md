# Release Maintenance

Use this playbook to prepare or publish a module release. Publishing a tag starts a
production workflow, so an AI agent must obtain explicit user approval before pushing it.

## Release Architecture

The release workflow runs when any tag is pushed.

It then:

1. Checks out `main` explicitly.
2. Reads the pushed tag as the release version.
3. Runs the version-bump command.
4. Commits `package.json`, `package-lock.json`, and `src/module.json`.
5. Builds the module.
6. Creates `module.json` and a ZIP artifact.
7. Creates or updates the GitHub release.
8. Publishes the version to the Foundry package repository.

The workflow builds current `main`, not an arbitrary feature branch. Merge and verify all
release content on `main` before creating the tag.

## Version Format

`tools/bump-version.ts` accepts:

- `x.y.z`
- `x.y.z-alpha`
- `x.y.z-beta`
- `x.y.z-rc.N`

The bump updates these files together:

- `package.json`
- `package-lock.json`
- `src/module.json`

Do not update only one of them.

## Preparation

1. Confirm every intended pull request is merged.
2. Switch to `main` and update it.
3. Confirm `main` contains the exact commit intended for publication.
4. Confirm Foundry VTT and dependency compatibility in `src/module.json`.
5. Confirm package supported versions in package entry points.
6. Run lint and build checks.
7. Complete the live Foundry VTT smoke test for compatibility or patch changes.
8. Review the release diff and choose the version.

```bash
git switch main
```

```bash
git pull --ff-only
```

```bash
git status --short --branch
```

```bash
npx eslint .
```

```bash
npm run build
```

The current lint command exits while loading `import/no-unresolved` with ESLint 10.0.3.
Record that validation blocker unless it has been fixed before the release.

Do not release with uncommitted files or an outstanding runtime-verification gap. Any
accepted lint blocker must be stated explicitly in the release review.

## Publication

Pushing a tag creates external state and can publish to both GitHub and Foundry.

1. Ask the user to approve the exact version and tag push.
2. Create the approved tag on the verified `main` commit.
3. Push only that tag.
4. Monitor the release workflow to completion.
5. Verify the workflow's version-bump commit reached `main`.
6. Verify the GitHub release contains `module.json` and the module ZIP.
7. Verify the manifest and download links contain the released version.
8. Verify the Foundry package listing accepted the release.

Do not report success while any workflow step is pending or failed.

## Review Boundaries

Keep these operations separate:

1. Compatibility, translations, patches, and runtime changes
2. Pull-request merge
3. Release approval
4. Tag creation and push
5. Workflow and artifact verification

The version-bump commit is release bookkeeping. Do not combine unrelated source changes
with it.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Tag points at a feature branch commit | Stop and verify current `main`; the workflow checks out `main` anyway |
| Version format is rejected | Use a supported `x.y.z`, alpha, beta, or release-candidate format |
| Only one version file changed | Run the repository bump command or update all three version files together |
| Build fails after the bump | Treat the release as failed and fix `main` before retrying |
| GitHub release exists without both artifacts | Inspect the build and ZIP steps before reporting success |
| Foundry publication fails | Verify the workflow request, compatibility values, and repository secret configuration |

## Related Documentation

- [Repository Guidelines](repository-guidelines.md) - Validation and history usage
- [Upgrade and Patch Maintenance](upgrade-and-patch-maintenance.md) - Compatibility readiness
- [AI Instruction Library](README.md) - Task routing
