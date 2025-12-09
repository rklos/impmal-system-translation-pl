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

Downloads files from the repository to `en/` and `pl/` directories. This command automatically:
- Clones the repository
- Copies configured file types
- Removes JavaScript files that don't contain any string literals (optimization to reduce files needing review)
- Reports the number of files deleted

### 2. Find Duplicated Lines (Optional)

```bash
npm run patch find-duplicated-lines
```

Analyzes English source files to find lines of code that appear multiple times. This analysis:
- Parses all `.js` files in the `temp/patches/en/scripts` directory
- Identifies lines that contain at least one string literal
- Finds lines that appear at least twice across different files
- Reports each common line with:
  - The complete line of code
  - Number of occurrences
  - List of files and line numbers where it appears
- Provides summary statistics

This is useful for:
- Identifying commonly duplicated code patterns before translation
- Planning consistent translations for repeated code
- Spotting opportunities for code consolidation
- Creating translation templates for common patterns

### 3. Translate Files

Edit files in `temp/patches/pl/`. The `en/` directory serves as reference.

#### 3.1. Apply Common Translations (Optional)

```bash
npm run patch apply -- --common
```

Automatically applies common translations from `patches/common-translations.json` to files in `temp/patches/pl/`. This is useful for:
- Translating frequently repeated strings across many files
- Maintaining consistency in translations
- Speeding up the initial translation process

The common translations file uses a simple JSON format:

```json
{
  "scripts": {
    "Source text": "Translated text",
    "Text with ${__1__} placeholder": "Tłumaczenie z ${__1__} placeholder"
  },
  "templates": {
    "Template text": "Tłumaczony tekst"
  }
}
```

**Pattern Matching:**
- Exact strings are matched literally
- Use `__N__` (where N is 1, 2, 3, etc.) as numbered placeholders to capture dynamic content
- Each `__N__` placeholder matches any content except newlines, quotes, and braces
- Numbered placeholders allow reordering captured content in translations
- Placeholders are replaced with their corresponding captured groups

**Examples:**
- `"Choose Arm": "Wybierz Ramię"` - Simple text replacement
- `"Trained ${__1__} for ${__2__} XP": "Wytrenowano ${__1__} za ${__2__} PD"` - Preserves template literal expressions in order
- `"${__1__} owns ${__2__}": "${__2__} posiada ${__1__}"` - Reordering captured groups (swaps order)
- `"Added <strong>": "Dodano <strong>"` - Works with HTML tags
- `"Took \"__1__\" Damage": "Otrzymano \"__1__\" Obrażeń"` - Works inside quotes

After applying common translations, review the changes and manually translate any remaining text.

### 4. Generate Patches

```bash
npm run patch create
```

Creates diff files by comparing `en/` and `pl/` directories.

### 5. Test Patches

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
