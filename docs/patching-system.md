# Patching System

The patching system modifies template files from external repositories without changing original source code.

## Overview

The system works by:
1. Downloading original files from GitHub repositories
2. Generating diff patches from modified files
3. Applying patches at runtime to override templates

## Directory Structure

```
src/packages/{package}/temp/patches/
├── en/                    # Original English files
├── pl/                    # Modified Polish files
└── download/              # Temporary clone directory

src/packages/{package}/patches/
└── static/templates/
    └── {template}.diff    # Generated patches
```

## Configuration

Configure patchable packages in `tools.config.ts`:

```typescript
export default {
  patch: {
    '{core-system}': ['scripts', 'static/templates'],
    'warhammer-library': ['static/templates'],
  },
};
```

Packages must export required values:

```typescript
export const PACKAGE = 'package-name';
export const REPO = 'owner/repository';
export const SUPPORTED_VERSION = '1.0.0';
```

## Workflow

### 1. Download Original Files

```bash
npm run patch download
```

Downloads files from the repository to `en/` and `pl/` directories.

### 2. Translate Files

Edit files in `temp/patches/pl/`. The `en/` directory serves as reference.

### 3. Generate Patches

```bash
npm run patch create
```

Creates diff files by comparing `en/` and `pl/` directories.

### 4. Test Patches

```bash
npm run patch apply
```

Applies patches to verify they work correctly.

## Updating Patches

When upstream releases new versions:

1. Download updated files:
   ```bash
   npm run patch download
   ```

2. Apply existing patches:
   ```bash
   npm run patch apply
   ```

3. Review results:
   - **Successful patches** - Keep existing translations
   - **Failed patches** - Re-translate manually

4. Remove failed patches:
   ```bash
   rm src/packages/{package}/patches/{failed-patch}.diff
   ```

5. Regenerate patches:
   ```bash
   npm run patch create
   ```

## Patch Format

Patches use unified diff format:

```diff
Index: static/templates/chat/roll/damage/damage-roll.hbs
===================================================================
--- static/templates/chat/roll/damage/damage-roll.hbs	en
+++ static/templates/chat/roll/damage/damage-roll.hbs	pl
@@ -1,6 +1,6 @@
 <div class="chat roll damageRoll">
     <div class="wrapper">
-        <h3 data-tooltip="{{this.result.breakdown.ed}}" data-tooltip-direction="UP">{{context.title}} - Damage</h3>
+        <h3 data-tooltip="{{this.result.breakdown.ed}}" data-tooltip-direction="UP">{{context.title}} - Obrażenia</h3>
```

## Runtime Application

Packages call `applyPatches()` during initialization:

```typescript
export function init() {
  applyPatches(PACKAGE);
}
```

The system fetches the original template, applies patches, and registers the translated version.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Patch application fails | Verify target file exists in `pl/` directory |
| Template not overridden | Check patch file location and `applyPatches()` call |
| Build errors | Check patch file syntax |

## Related Documentation

- [Package Development](package-development.md) - Package configuration
- [Translation Guide](translation-guide.md) - Translation workflow
