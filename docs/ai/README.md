# AI Instruction Library

This directory contains task-focused instructions for AI agents working in this
repository. Start here, then load only the playbooks required for the current task.

## How to Use This Library

1. Read the repository root `AGENTS.md`.
2. Read [Repository Guidelines](repository-guidelines.md) for every task.
3. Select the matching task playbooks from the table below.
4. Read the linked human documentation when the task changes the documented workflow.
5. Verify instructions against current code and configuration before relying on version
   numbers, paths, or commands.

## Task Routing

| Task | Required AI playbook | Human reference |
|------|----------------------|-----------------|
| Any repository change | [Repository Guidelines](repository-guidelines.md) | [Documentation Hub](../README.md) |
| Fix or refactor runtime code | [Repository Guidelines](repository-guidelines.md) | [Package Development](../package-development.md) |
| Add or change a package | [Repository Guidelines](repository-guidelines.md) | [Package Development](../package-development.md) |
| Add custom translations, scripts, or styles | [Translation Maintenance](translation-maintenance.md) | [Custom Package](../custom-package.md) |
| Translate or synchronize language files | [Translation Maintenance](translation-maintenance.md) | [Translation Guide](../translation-guide.md) |
| Add or change development tools | [Tool Development](tool-development.md) | [Package Development](../package-development.md) |
| Change dependencies or build configuration | [Repository Guidelines](repository-guidelines.md) | [Package Development](../package-development.md) |
| Add or revise documentation | [Documentation Maintenance](documentation-maintenance.md) | [Documentation Hub](../README.md) |
| Upgrade Foundry VTT, ImpMal, WHLib, or Babele | [Upgrade and Patch Maintenance](upgrade-and-patch-maintenance.md) | [Patching System](../patching-system.md) |
| Create, refresh, remove, or audit patches | [Upgrade and Patch Maintenance](upgrade-and-patch-maintenance.md) | [Patching System](../patching-system.md) |
| Prepare or publish a release | [Release Maintenance](release-maintenance.md) | [Release Workflow](../../.github/workflows/release.yml) |

For a task that spans several rows, read every matching playbook.

If a task is not listed, use [Repository Guidelines](repository-guidelines.md), inspect the
relevant code and history, and add a focused playbook only when the workflow is likely to
repeat or contains a non-obvious risk.

## Library Boundaries

- Keep `AGENTS.md` short. It should route work and state only repository-wide constraints.
- Put detailed, repeatable procedures in this directory.
- Keep user-facing explanations and command references in the main `docs/` directory.
- Link to an existing document instead of copying its content.
- Record current behavior and durable pitfalls, not the history of one work session.
- Never store private implementation plans, credentials, temporary notes, or branch-specific
  instructions here.

## Adding Instructions

Add a playbook when a workflow is repeated, has several verification steps, or has a
non-obvious failure mode.

1. Verify every command and path against the repository.
2. Give the file one clear responsibility.
3. Add it to the task-routing table.
4. Link related human documentation.
5. Include success criteria and troubleshooting guidance.
6. Remove or update any instruction made stale by the change.

## Related Documentation

- [Documentation Hub](../README.md) - Human-facing project documentation
- [Patching System](../patching-system.md) - Patch command reference
- [Translation Guide](../translation-guide.md) - Translation rules and basic workflow
