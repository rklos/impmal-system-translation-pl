# Patching System Documentation

## Overview

The patching system is a core component of the Imperium Maledictum System Translation project that allows for dynamic modification of template files and other assets from external repositories. This system enables the translation team to apply Polish translations to HTML templates and other files without modifying the original source code.

## Architecture

### Core Components

1. **Patch Command Tools** (`tools/commands/patch/`)
   - `download.ts` - Downloads original files from GitHub repositories
   - `create.ts` - Generates diff patches from modified files
   - `apply.ts` - Applies patches to target files
   - `command.ts` - Main command orchestrator

2. **Runtime Patch Application** (`src/utils/apply-patches.ts`)
   - Applies patches at runtime to override templates
   - Integrates with Vite build system

3. **Build System Integration** (`.vite/load-patches.ts`)
   - Loads and injects patches during build process
   - Converts patch files to runtime-usable format

## Directory Structure

```
patches/                          # Working directory for patch operations
├── {package}/                    # Package-specific directories
│   ├── en/                       # Original English files
│   ├── pl/                       # Modified Polish files
│   └── temp/                     # Temporary clone directory

src/packages/{package}/patches/   # Generated patch files
├── static/
│   └── templates/
│       └── {template}.diff       # Unified diff files

tools.config.ts                   # Configuration for patchable file types
```

## Configuration

### Package Configuration

Each package that supports patching must be configured in `tools.config.ts`:

```typescript
export default {
  patch: {
    impmal: ['scripts', 'static/templates'],
    'warhammer-library': ['static/templates'],
  },
};
```

This configuration specifies which directories from the source repository should be included in the patching process.

### Package Definition

Packages must implement the `Package` interface:

```typescript
export interface Package {
  PACKAGE: string;        // Package identifier
  REPO: string;          // GitHub repository (owner/repo)
  SUPPORTED_VERSION: string; // Compatible version
}
```

Example from `src/packages/impmal/index.ts`:
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

**What it does:**
- Clones the target repository to a temporary directory
- Copies specified file types to both `en/` and `pl/` directories
- Cleans up temporary files

**Process:**
1. Removes existing `en/`, `pl/`, and `temp/` directories
2. Clones the repository specified in `pkg.REPO`
3. Copies files from configured directories (`tools.config.ts`)
4. Creates identical copies in both `en/` and `pl/` directories

### 2. Manual Translation

After downloading, manually edit files in the `patches/{package}/pl/` directory to apply Polish translations. The `en/` directory serves as the reference for the original English content.

### 3. Generate Patches

```bash
npm run patch create
```

**What it does:**
- Compares files between `en/` and `pl/` directories
- Generates unified diff files for changed files
- Saves patches to `src/packages/{package}/patches/`

**Process:**
1. Scans both `en/` and `pl/` directories recursively
2. Compares file contents to identify changes
3. Generates unified diff format patches using the `diff` library
4. Saves patches with `.diff` extension in the appropriate directory structure

### 4. Apply Patches (Development)

```bash
npm run patch apply
```

**What it does:**
- Applies generated patches to files in the `pl/` directory
- Useful for testing patch application during development

**Process:**
1. Reads patch files from `src/packages/{package}/patches/`
2. Parses unified diff format
3. Applies patches to corresponding files in `patches/{package}/pl/`
4. Reports success/failure for each patch

### 5. Runtime Application

Patches are automatically applied at runtime through the build system integration:

**Build Process:**
1. `.vite/load-patches.ts` scans for patch files during build
2. Converts patches to structured format
3. Injects patches into the build output
4. `src/utils/apply-patches.ts` applies patches at runtime

**Runtime Process:**
1. `applyPatches()` function is called during module initialization
2. Patches are applied to template files via Handlebars partial registration
3. Original templates are overridden with translated versions

## Updating Patches After System Updates

When the original system (e.g., ImpMal) releases a new version, you need to update your patches to maintain compatibility. This workflow allows you to preserve existing translations while adapting to upstream changes.

### Update Workflow

#### 1. Download Updated Files

```bash
npm run patch download
```

This downloads the latest version of the original files, overwriting the `en/` directory with the new content.

#### 2. Apply Existing Patches

```bash
npm run patch apply
```

This applies your existing patches to the updated files in the `pl/` directory. This step is crucial because it:
- Preserves your existing Polish translations
- Updates the `pl/` directory with the new file structure
- Allows you to see which translations are still valid

#### 3. Review and Update Translations

After applying patches, review the files in `patches/{package}/pl/` directory:

**Files that applied successfully:**
- These files maintain your existing translations
- No additional work needed unless you want to improve translations

**Files that failed to apply:**
- These files have changed significantly in the upstream version
- You'll need to manually re-translate these files

#### 4. Handle Patch Failures

If `npm run patch apply` reports errors for specific files:

1. **Remove the problematic patch file:**
   ```bash
   rm src/packages/{package}/patches/{path/to/failed.patch}.diff
   ```

2. **Manually translate the file from scratch:**
   - Copy the content from `patches/{package}/en/{file}` to `patches/{package}/pl/{file}`
   - Apply your Polish translations manually
   - This ensures you're working with the latest version

#### 5. Regenerate Patches

```bash
npm run patch create
```

This creates new patch files based on the differences between the updated `en/` and `pl/` directories.

### Benefits of This Approach

1. **Preserves Existing Work:** You don't need to re-translate files that haven't changed
2. **Identifies Conflicts:** The apply step clearly shows which files need attention
3. **Maintains History:** Your translation work is preserved where possible
4. **Efficient Updates:** Only changed files require manual intervention

### Example Scenario

1. **Original state:** You have patches for 50 template files
2. **System update:** ImpMal releases version 3.1.0
3. **Download:** `npm run patch download` gets the new files
4. **Apply:** `npm run patch apply` successfully applies 45 patches, fails on 5
5. **Review:** 45 files are automatically updated, 5 need manual work
6. **Manual work:** Re-translate the 5 problematic files
7. **Create:** `npm run patch create` generates new patches for all 50 files

This approach saves significant time by preserving 90% of your existing translation work while ensuring compatibility with the new version.

## Patch File Format

Patches use the unified diff format generated by the `diff` library:

```diff
Index: static/templates/chat/roll/damage/damage-roll.hbs
===================================================================
--- static/templates/chat/roll/damage/damage-roll.hbs	en
+++ static/templates/chat/roll/damage/damage-roll.hbs	pl
@@ -1,6 +1,6 @@
 <div class="wrath-and-glory chat roll damageRoll">
     <div class="wrapper">
-        <h3 data-tooltip="{{this.result.breakdown.ed}}" data-tooltip-direction="UP">{{context.title}} - Damage</h3>
+        <h3 data-tooltip="{{this.result.breakdown.ed}}" data-tooltip-direction="UP">{{context.title}} - Obrażenia</h3>
```

## Integration with Translation System

### Module Initialization

Each package that uses patching calls `applyPatches()` during initialization:

```typescript
export function init() {
  reorderSkills();
  reorderActions();
  applyPatches(PACKAGE);  // Apply patches for this package
}
```

### Template Override

The patching system works by:
1. Fetching the original template from the game system
2. Applying patches to the template content
3. Registering the patched template as a Handlebars partial
4. Overriding the original template path

This approach ensures that:
- Original files remain unchanged
- Patches can be easily updated and versioned
- The system works with any FoundryVTT module structure

## Best Practices

### 1. Patch Management

- Keep patches focused and minimal
- Test patches thoroughly before committing
- Use descriptive patch file names
- Document complex patches with comments

### 2. Version Compatibility

- Always verify compatibility with the target version
- Test patches against different module versions
- Update patches when upstream changes occur

### 3. Error Handling

The system includes comprehensive error handling:
- Validates patch file format
- Checks for missing target files
- Reports patch application failures
- Graceful fallback to original templates

### 4. Performance Considerations

- Patches are applied once during module initialization
- Template overrides are cached by Handlebars
- Minimal runtime overhead after initial application

## Troubleshooting

### Common Issues

1. **Patch Application Fails**
   - Verify target file exists in `patches/{package}/pl/`
   - Check patch file format and syntax
   - Ensure patch context matches current file content

2. **Template Not Overridden**
   - Verify patch file is in correct directory structure
   - Check that `applyPatches()` is called during initialization
   - Confirm template path matches patch target

3. **Build Errors**
   - Check patch file syntax
   - Verify all referenced files exist
   - Review console output for specific error messages

### Debugging

Enable verbose logging by checking console output during:
- Patch creation: Look for file comparison results
- Patch application: Monitor success/failure messages
- Runtime application: Check template override confirmations
