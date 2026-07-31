# Documentation

This is the documentation hub for the FoundryVTT System Translation project. The project translates FoundryVTT modules from English to Polish.

## Guides

- [Translation Guide](translation-guide.md) - How to translate language files
- [Package Development](package-development.md) - How to create and manage packages
- [Patching System](patching-system.md) - How to modify templates
- [Custom Package](custom-package.md) - How to add custom functionality
- [Foundry V14 Development and Testing](foundry-v14-development-and-testing.md) - Run interactive and isolated Foundry test environments

## AI Instructions

- [AI Instruction Library](ai/README.md) - Task-focused guidance for AI agents

## Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all Foundry-independent unit tests |
| `npm run build` | Build packages and combine translations |
| `npm run foundry:start` | Bootstrap the persistent development environment |
| `npm run typecheck:foundry` | Type-check the Playwright suite |
| `npm run test:foundry` | Run module-owned tests in an isolated Testcontainers instance |
| `npm run test:foundry:devcontainer` | Run host tests against the persistent development instance |
| `npm run report` | Check for missing or extra translations |
| `npm run sync wfrp4e` | Sync with official WFRP4e translations |
| `npm run patch download` | Download original files and remove JS files without translatable strings |
| `npm run patch create` | Generate patches from modified files |
| `npm run patch apply` | Apply patches to test files |
