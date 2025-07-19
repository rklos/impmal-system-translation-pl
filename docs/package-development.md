# Package Development

This guide explains how to create and manage packages in the FoundryVTT System Translation project.

## Overview

Packages are modular units that contain translations, scripts, and styles for specific FoundryVTT modules. Each package follows a consistent structure and integrates with the build system.

## Package Structure

### Standard Directory Layout

```
src/packages/{package-name}/
├── index.ts                # Package entry point
├── lang.json               # Translation file
├── types.d.ts              # TypeScript declarations (optional)
├── scripts/                # TypeScript files
│   └── {script-name}.ts
├── styles/                 # SCSS files
│   └── {style-name}.scss
├── patches/                # Generated patch files (optional)
└── temp/                   # Temporary working directory (optional)
    └── patches/
```

### Package Types

- **System Packages**: Core system translations (`{core-system}`, `warhammer-library`)
- **Custom Package**: Quality-of-life enhancements (`custom`)
- **Future Packages**: Additional modules as the project grows

## Creating a Package

### 1. Create Directory Structure

```bash
mkdir -p src/packages/{new-package}/{scripts,styles}
```

### 2. Add Entry Point (`index.ts`)

```typescript
export const PACKAGE = 'new-package';

// Optional: GitHub repository for upstream source
export const REPO = 'owner/repository';

// Optional: Supported version
export const SUPPORTED_VERSION = '1.0.0';

export function init() {
  // Package initialization code
}
```

### 3. Add Translation File (`lang.json`)

```json
{
  "// Package description": "",
  "PACKAGE.Key": "Translation",
  "PACKAGE.Nested.Key": "Nested Translation"
}
```

### 4. Update Main Index

Add export to `src/packages/index.ts`:

```typescript
export * as newPackage from './new-package';
```

## File Types and Purposes

### Entry Points (`index.ts`)

**Required exports:**
- `PACKAGE`: Package identifier string
- `init`: Initialization function

**Optional exports:**
- `REPO`: GitHub repository for upstream source
- `SUPPORTED_VERSION`: Compatible version string

### Translation Files (`lang.json`)

JSON files containing translation key-value pairs:

```json
{
  "// comment": "Documentation comment",
  "SYSTEM.ActorType": "Typ Aktora",
  "WH.Script": "Skrypt"
}
```

**Guidelines:**
- Use namespace prefixes for organization
- Include comments for documentation
- Preserve HTML tags in rich text
- Keep placeholder variables unchanged

### Script Files (`scripts/`)

TypeScript files for functionality:

**Types:**
- Enhancement scripts
- Custom labels
- Sheet modifications
- Utility functions

**Naming:**
- Use kebab-case for file names
- Group related scripts in subdirectories
- Use descriptive names

### Style Files (`styles/`)

SCSS files for visual presentation:

**Types:**
- Main stylesheets
- Component styles
- Sheet styles
- Theme customization

**Organization:**
- Use SCSS for better maintainability
- Follow BEM naming conventions
- Avoid conflicts with existing styles
- Import additional styles in `main.scss`

## Build Integration

### Automatic Processing

The build system automatically:

1. **Bundles translations**: Combines all `lang.json` files into `dist/lang/pl.json`
2. **Compiles scripts**: TypeScript files are compiled and bundled
3. **Processes styles**: SCSS files are compiled to CSS
4. **Loads packages**: Packages are loaded in the correct order

### Style Import System

- `styles/main.scss` is automatically imported
- Additional styles should be imported manually in `main.scss`
- No manual import required for the main stylesheet

## Best Practices

### File Organization
- Keep related files together in appropriate subdirectories
- Use consistent naming conventions
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

## Package Configuration

### Patching Support

For packages that support template patching, add configuration to `tools.config.ts`:

```typescript
export default {
  patch: {
    'new-package': ['scripts', 'static/templates'],
  },
};
```

This enables the patching system for specified directories.

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Missing entry point | Ensure `index.ts` has required exports |
| Import errors | Check that all exports are properly defined |
| Build failures | Verify file structure follows conventions |
| Style conflicts | Ensure custom styles don't override system styles |

### Debugging
- Check console for import/export errors
- Verify file paths and naming
- Test individual package functionality
- Review build process integration

## Related Documentation

- [Translation Guide](translation-guide.md) - How to translate language files
- [Patching System](patching-system.md) - Template modification system
- [Custom Package](custom-package.md) - Custom functionality guidelines 