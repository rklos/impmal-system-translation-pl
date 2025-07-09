# Patching System

The patching system allows dynamic modification of template files and assets from external repositories without changing the original source code.

## Overview

This system enables applying Polish translations to HTML templates and other files by:
1. Downloading original files from GitHub repositories
2. Generating diff patches from modified files
3. Applying patches at runtime to override templates

## Architecture

### Core Components

- **Patch Commands** (`tools/commands/patch/`)
  - `download.ts` - Downloads original files
  - `create.ts` - Generates diff patches
  - `apply.ts` - Applies patches to test files
  - `command.ts` - Main orchestrator

- **Runtime Application** (`src/utils/apply-patches.ts`)
  - Applies patches at runtime
  - Integrates with Vite build system

- **Build Integration** (`.vite/load-patches.ts`)
  - Loads patches during build
  - Converts to runtime format

## Directory Structure

```
patches/                          # Working directory
├── {package}/                    # Package-specific directories
│   ├── en/                       # Original English files
│   ├── pl/                       # Modified Polish files
│   └── temp/                     # Temporary clone directory

src/packages/{package}/patches/   # Generated patch files
├── static/
│   └── templates/
│       └── {template}.diff       # Unified diff files
```

## Configuration

### Package Configuration

Configure patchable packages in `tools.config.ts`:

```typescript
export default {
  patch: {
    impmal: ['scripts', 'static/templates'],
    'warhammer-library': ['static/templates'],
  },
};
```

### Package Definition

Packages must implement required exports:

```typescript
export const PACKAGE = 'impmal';
export const REPO = 'moo-man/ImpMal-FoundryVTT';
export const SUPPORTED_VERSION = module.relationships.systems[0].compatibility.verified;
```

## Workflow

### 1. Download Original Files

```bash
npm run patch download
```

**Process:**
1. Removes existing directories
2. Clones repository to temporary directory
3. Copies configured files to `en/` and `pl/` directories
4. Cleans up temporary files

### 2. Manual Translation

Edit files in `patches/{package}/pl/` to apply Polish translations. The `en/` directory serves as reference.

### 3. Generate Patches

```bash
npm run patch create
```

**Process:**
1. Compares `en/` and `pl/` directories
2. Generates unified diff files for changed files
3. Saves patches to `src/packages/{package}/patches/`

### 4. Test Patch Application

```bash
npm run patch apply
```

Applies generated patches to files in the `pl/` directory for testing.

### 5. Runtime Application

Patches are automatically applied at runtime:

1. Build system scans for patch files
2. Converts patches to structured format
3. `applyPatches()` applies patches during module initialization
4. Templates are overridden with translated versions

## Updating Patches

When upstream systems release new versions, update patches to maintain compatibility:

### Update Workflow

1. **Download Updated Files**
   ```bash
   npm run patch download
   ```

2. **Apply Existing Patches**
   ```bash
   npm run patch apply
   ```
   - Preserves existing translations
   - Updates `pl/` directory with new structure
   - Shows which translations are still valid

3. **Review and Update**
   - **Successful patches**: Maintain existing translations
   - **Failed patches**: Require manual re-translation

4. **Handle Failures**
   ```bash
   rm src/packages/{package}/patches/{failed-patch}.diff
   ```
   Then manually translate the problematic files.

5. **Regenerate Patches**
   ```bash
   npm run patch create
   ```

### Benefits

- **Preserves Work**: Don't re-translate unchanged files
- **Identifies Conflicts**: Clear indication of files needing attention
- **Efficient Updates**: Only changed files require manual work

## Patch File Format

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

## Integration

### Module Initialization

Packages call `applyPatches()` during initialization:

```typescript
export function init() {
  reorderSkills();
  reorderActions();
  applyPatches(PACKAGE);
}
```

### Template Override

The system:
1. Fetches original template from game system
2. Applies patches to template content
3. Registers patched template as Handlebars partial
4. Overrides original template path

## Best Practices

### Patch Management
- Keep patches focused and minimal
- Test patches thoroughly before committing
- Use descriptive patch file names
- Document complex patches with comments

### Version Compatibility
- Always verify compatibility with target version
- Test patches against different module versions
- Update patches when upstream changes occur

### Error Handling
The system includes comprehensive error handling:
- Validates patch file format
- Checks for missing target files
- Reports patch application failures
- Graceful fallback to original templates

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Patch application fails | Verify target file exists in `pl/` directory |
| Template not overridden | Check patch file location and `applyPatches()` call |
| Build errors | Check patch file syntax and referenced files |

### Debugging
Enable verbose logging by checking console output during:
- Patch creation: File comparison results
- Patch application: Success/failure messages
- Runtime application: Template override confirmations

## Related Documentation

- [Package Development](package-development.md) - How to configure packages for patching
- [Translation Guide](translation-guide.md) - Translation workflow
- [Custom Package](custom-package.md) - Custom functionality guidelines
