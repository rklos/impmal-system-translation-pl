# Package Development

This guide explains how to create and manage packages in the project.

## Package Structure

```
src/packages/{package-name}/
├── index.ts          # Package entry point
├── lang.json         # Translation file
├── scripts/          # TypeScript files
├── styles/           # SCSS files
├── patches/          # Generated patch files
└── temp/             # Temporary working directory
```

## Creating a Package

### 1. Create Directory Structure

```bash
mkdir -p src/packages/{new-package}/{scripts,styles}
```

### 2. Add Entry Point

Create `index.ts`:

```typescript
export const PACKAGE = 'new-package';
export const REPO = 'owner/repository';
export const SUPPORTED_VERSION = '1.0.0';

export function init() {
  // Package initialization
}
```

### 3. Add Translation File

Create `lang.json`:

```json
{
  "// Package description": "",
  "PACKAGE.Key": "Translation",
  "PACKAGE.Nested.Key": "Nested Translation"
}
```

### 4. Register Package

Add export to `src/packages/index.ts`:

```typescript
export * as newPackage from './new-package';
```

## Entry Point Exports

**Required:**
- `PACKAGE` - Package identifier string
- `init` - Initialization function

**Optional:**
- `REPO` - GitHub repository for upstream source
- `SUPPORTED_VERSION` - Compatible version string

## Patching Support

To enable patching for a package, add configuration to `tools.config.ts`:

```typescript
export default {
  patch: {
    'new-package': ['scripts', 'static/templates'],
  },
};
```

## Build Integration

The build system automatically:
- Bundles all `lang.json` files into `dist/lang/pl.json`
- Compiles TypeScript files
- Processes SCSS files
- Imports `styles/main.scss` automatically

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Missing entry point | Ensure `index.ts` has required exports |
| Import errors | Check that all exports are properly defined |
| Build failures | Verify file structure follows conventions |
| Style conflicts | Ensure custom styles don't override system styles |

## Related Documentation

- [Translation Guide](translation-guide.md) - Translation workflow
- [Patching System](patching-system.md) - Template modification
- [Custom Package](custom-package.md) - Custom functionality
