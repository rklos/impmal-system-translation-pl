# Documentation

This is the documentation hub for the FoundryVTT System Translation project. The project translates FoundryVTT modules from English to Polish.

## Guides

- [Translation Guide](translation-guide.md) - How to translate language files
- [Package Development](package-development.md) - How to create and manage packages
- [Patching System](patching-system.md) - How to modify templates
- [Custom Package](custom-package.md) - How to add custom functionality

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build packages and combine translations |
| `npm run report` | Check for missing or extra translations |
| `npm run sync wfrp4e` | Sync with official WFRP4e translations |
| `npm run patch download` | Download original files and remove JS files without translatable strings |
| `npm run patch create` | Generate patches from modified files |
| `npm run patch apply` | Apply patches to test files |
