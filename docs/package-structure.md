# Package Structure Documentation

## Overview

This document describes the file structure and organization of packages within the Imperium Maledictum System Translation project. Each package follows a consistent structure to maintain organization and facilitate the build process.

## Package Types

The project contains three main types of packages:

1. **System Packages**: Core system translations (`impmal`, `warhammer-library`)
2. **Custom Package**: Custom additions and enhancements (`custom`)
3. **Future Packages**: Additional packages that may be added as the project grows

## Standard Package Structure

Each package follows this standard directory structure:

```
src/packages/{package-name}/
├── index.ts                # Package entry point
├── lang.json               # Translation file
├── types.d.ts              # Types of global variables created by the system/module
├── scripts/                # TypeScript files
│   └── {script-name}.ts
└── styles/                 # SCSS files
    └── {style-name}.scss
```

## File Types and Purposes

### Entry Points (`index.ts`)

Each package has an `index.ts` file that serves as the entry point and must define certain required and optional exports:

#### Required Exports

- `PACKAGE`: A `const` string with the package name (e.g., `'impmal'`, `'custom'`).
- `init`: A function that initializes the package (called during system setup).

#### Optional Exports

- `REPO`: A `const` string with the GitHub repository of the upstream source (if applicable).
- `SUPPORTED_VERSION`: A `const` indicating the supported system/module version (if applicable).

#### Example
```typescript
export const PACKAGE = 'warhammer-library';
export const REPO = 'moo-man/WarhammerLibrary-FVTT';
export const SUPPORTED_VERSION = '2.2.0';

export function init() {}
```


### Translation Files (`lang.json`)

JSON files containing translation key-value pairs:

```json
{
  "// comment": "Documentation comment",
  "IMPMAL.ActorType": "Typ Aktora",
  "WH.Script": "Skrypt"
}
```

**Structure**:
- **Comments**: Keys starting with `//` for documentation
- **Namespaced Keys**: Use prefixes like `IMPMAL.` or `WH.` for organization
- **Hierarchical Structure**: Nested objects for complex translations
- **HTML Content**: Preserve HTML tags in rich text translations

### Script Files (`scripts/`)

TypeScript files for functionality:

**Types**:
- **Enhancement Scripts**: Improve existing functionality
- **Custom Labels**: Handle translation differentiation
- **Sheet Scripts**: Character sheet specific enhancements
- **Utility Scripts**: Helper functions and utilities
- Any other types of scripts necesary for proper translations

**Naming Convention**:
- Use kebab-case for file names
- Group related scripts in subdirectories
- Use descriptive names that indicate purpose

### Style Files (`styles/`)

SCSS files for visual presentation:

**Types**:
- **Main Stylesheets**: Primary styling for the package
- **Component Styles**: Specific component styling
- **Sheet Styles**: Character sheet and form styling
- **Theme Styles**: Visual theme and customization

**Organization**:
- Use SCSS for better organization and maintainability
- Group related styles in subdirectories
- Follow BEM or similar naming conventions
- Ensure styles don't conflict with existing system styles

**Import System**:
- `styles/main.scss` is automatically imported by the `auto-import-styles.ts` tool
- No manual import is required for the main stylesheet
- Additional style files should be imported manually inside `main.scss` file

## Package Integration

### Build Process Integration

Packages are integrated into the main build process:

1. **Translation Bundling**: All `lang.json` files are combined into `dist/lang/pl.json`
2. **Script Compilation**: TypeScript files are compiled and bundled
3. **Style Compilation**: SCSS files are compiled to CSS and included
4. **Package Loading**: Packages are loaded in the correct order

## Adding New Packages

### Creating a New Package

1. **Create Directory Structure**:
   ```
   src/packages/{new-package}/
   ├── index.ts
   ├── lang.json
   ├── scripts/
   └── styles/
   ```

2. **Add Entry Point** (`index.ts`):
   ```typescript
   export const PACKAGE = 'new-package';

   export function init() {}
   ```

3. **Add Translation File** (`lang.json`):
   ```json
   {
     "// Package description": "",
     "PACKAGE.Key": "Translation"
   }
   ```

4. **Update Main Index**: Add export to main package index

5. **Update Build Process**: Ensure new package is included in bundling

### Package Naming Conventions

- Use lowercase with hyphens for package names
- Use descriptive names that indicate purpose
- Follow existing naming patterns
- Avoid conflicts with existing package names

## Best Practices

### File Organization
- Keep related files together in appropriate subdirectories
- Use consistent naming conventions across packages
- Maintain clear separation of concerns
- Document any deviations from standard structure

### Translation Management
- Use appropriate namespaces for translation keys
- Include comments for custom additions
- Maintain consistency with existing translations
- Test translations in context

### Script Development
- Follow TypeScript best practices
- Include proper error handling
- Document dependencies and requirements
- Test compatibility with different FoundryVTT versions

### Style Development
- Use SCSS for better organization
- Follow established naming conventions
- Ensure styles don't conflict with existing styles
- Test across different themes and resolutions

## Troubleshooting

### Common Issues
1. **Missing Entry Points**: Ensure each package has a proper `index.ts`
2. **Import Errors**: Check that all exports are properly defined
3. **Build Failures**: Verify file structure follows conventions
4. **Style Conflicts**: Ensure custom styles don't override system styles

### Debugging
- Check console for import/export errors
- Verify file paths and naming
- Test individual package functionality
- Review build process integration

## Related Documentation

- `docs/translation-process.md` - Translation workflow and guidelines
- `docs/custom-package.md` - Custom package specific documentation
- `tools/bundle-jsons.ts` - Translation bundling process
- `src/module.json` - Module configuration 