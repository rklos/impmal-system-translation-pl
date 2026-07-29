# Tool Development

Use this playbook when adding or changing scripts under `tools/`, build helpers, or tool
configuration.

## Design Boundaries

- Keep reusable command behavior under `tools/`.
- Keep project-specific values in `tools.config.ts` or package exports.
- Keep runtime Foundry code under `src/`.
- Use `parseArgs` for command arguments, matching existing commands.
- Resolve paths from module locations. Do not add hardcoded absolute paths.
- Use `chalk` consistently for actionable terminal output.
- Return a failing exit status when the requested operation is incomplete.

## Change Workflow

1. Read the command entry point and its action implementation.
2. Read shared constants and configuration before adding paths or package names.
3. Identify which packages the command iterates over.
4. Reproduce the current behavior with the smallest safe input.
5. Make the minimum requested change.
6. Exercise both the success and failure paths.
7. Run lint and build validation.

```bash
npx eslint .
```

```bash
npm run build
```

The current lint command exits while loading `import/no-unresolved` with ESLint 10.0.3.
Report that existing blocker if it remains. Do not claim that project files were linted.

## Network Access

The report, synchronization, and download commands access GitHub.

- Prefer Git, GitHub CLI, or the project's HTTP utilities for non-visual work.
- If the sandbox blocks CLI networking, request network permission and retry the same
  command.
- Use an exact release tag when reproducibility matters.
- Do not silently substitute a default branch for a requested release.
- Do not use browser automation as a general HTTP client when CLI permission can be
  requested.

## Patch Command Safety

Verify these current behaviors before changing or invoking patch tools:

- `patch download` clones each upstream repository's default branch. It does not use
  `SUPPORTED_VERSION`.
- `patch apply` stops the process at the first missing target or failed patch and mutates
  the Polish working tree as it progresses.
- `patch create` removes each tracked package patch directory before rebuilding it from
  the complete English and Polish working trees. It preserves
  `common-translations.json`.
- Common template translations inspect only direct files in the template directory, not
  nested directories.

Do not broaden these mechanisms during a patch-only task unless the user requests a
tooling change. Account for the limitations in the audit procedure instead.

## Output Requirements

A tool should make the final state unambiguous:

- identify the package and exact version or Git reference;
- report every skipped package or file;
- distinguish warnings from successful work;
- avoid a final success message after an unrecovered error;
- provide a nonzero exit status when required work failed.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| GitHub cannot be resolved from a CLI command | Request network permission, then retry the CLI command |
| A command uses newer upstream files than expected | Check whether it used a default branch instead of the supported tag |
| Patch apply reports only one failure | Reset the working input and audit every patch independently |
| Patch create removes unrelated patches | Restore from Git, repopulate complete working trees, and regenerate only after review |
| A tool prints success after errors | Fix error propagation and exit status before relying on automation |
| ESLint exits while loading `import/no-unresolved` | Report the existing configuration blocker unless ESLint maintenance is in scope |

## Related Documentation

- [Repository Guidelines](repository-guidelines.md) - Project commands and boundaries
- [Upgrade and Patch Maintenance](upgrade-and-patch-maintenance.md) - Safe use of patch commands
- [Patching System](../patching-system.md) - Existing patch command reference
