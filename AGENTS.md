# Repository Instructions

## Scope

This file contains repository-specific guidance. User-level and parent `AGENTS.md`
instructions still apply.

## Required Reading

Before changing this repository:

1. Read [docs/ai/README.md](docs/ai/README.md).
2. Read every playbook listed there for the current task.
3. Use the existing documents under `docs/` as the human-facing source of truth for
   documented workflows.

For a mixed task, read all relevant playbooks. Do not copy their contents into this file.

## Sources of Truth

- Use `src/module.json` for Foundry VTT, ImpMal, and required-module compatibility.
- Use each package's `index.ts` for its repository and supported upstream version.
- Use `package.json` for available commands and installed tools.
- Use `tools.config.ts` for package-specific tool configuration.
- Treat `dist/` and package `temp/` directories as generated or working data.

If an instruction conflicts with current configuration or code, verify the intended
behavior and follow the verified source. Update the stale instruction when it directly
governs the current work. Otherwise, report it without expanding the task.

## Change Boundaries

- Keep translation, patch, runtime, tooling, and documentation changes reviewable as
  separate steps.
- Do not commit, push, or open a pull request unless the user asks.
- Do not add generated `dist/` files or package `temp/` files to version control.
- Modify tracked files in the repository. Use scratch directories only for immutable
  upstream checkouts, reports, or other disposable inputs.

## Standard Validation

Run validation that matches the change:

- TypeScript, styles, build configuration, translations, or patches: `npm run build`
- TypeScript or JavaScript: `npx eslint .`
- Any tracked change: `git diff --check`
- Upstream patches: exact-version applicability audit and a live Foundry VTT smoke test

`npx eslint .` currently exits while loading `import/no-unresolved` with ESLint 10.0.3,
before linting project files. Run it to detect whether the configuration has been fixed.
If the same loader error remains, report it as an existing validation blocker unless the
task includes ESLint maintenance.

Passing the build proves that patches can be bundled. It does not prove that Foundry VTT
loads or registers the patched templates and scripts correctly.
