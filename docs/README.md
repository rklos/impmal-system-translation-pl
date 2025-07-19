# Documentation

This directory contains comprehensive documentation for the FoundryVTT System Translation project.

## Quick Start

1. **[Translation Guide](translation-guide.md)** - How to translate and maintain language files
2. **[Package Development](package-development.md)** - How to create and manage packages
3. **[Patching System](patching-system.md)** - How to patch templates and assets
4. **[Custom Package](custom-package.md)** - How to add custom functionality

## Project Overview

This project translates FoundryVTT modules from English to Polish using a modular package system. Each package contains translations, scripts, and styles for a specific module.

### Key Components

- **Packages**: Modular units containing translations and enhancements
- **Patching System**: Dynamic template modification without source changes
- **Build Tools**: Automated translation bundling and validation
- **Custom Package**: Extensible system for quality-of-life improvements

### Directory Structure

```
src/packages/
├── {core-system}/        # Core system translations
│   ├── temp/            # Temporary working directory
│   └── patches/         # Generated patch files
├── warhammer-library/   # Shared Warhammer functionality
├── custom/              # Custom enhancements
└── {future-packages}/   # Additional modules
```

## Getting Started

1. **For Translators**: Start with [Translation Guide](translation-guide.md)
2. **For Developers**: Read [Package Development](package-development.md)
3. **For Template Modifications**: See [Patching System](patching-system.md)
4. **For Custom Features**: Check [Custom Package](custom-package.md)

## Tools and Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Build all packages and combine translations |
| `npm run report` | Check for missing or extra translations |
| `npm run sync wfrp4e` | Sync with official WFRP4e translations |
| `npm run patch download` | Download original files for patching |
| `npm run patch create` | Generate patches from modified files |
| `npm run patch apply` | Apply patches to test files | 