# Custom Package

The custom package (`src/packages/custom/`) contains quality-of-life improvements and custom functionality that enhance the translation project beyond basic language files.

## Overview

This package serves as an extensible container for:
- Custom translations not present in original modules
- Quality-of-life scripts and enhancements
- Custom styles and visual improvements
- Differentiation cases for Polish language requirements

## Current Contents

### Custom Translations (`lang.json`)

Contains translation keys not present in original modules:

```json
{
  "// custom keys which are not present in ImpMal system nor WH library": "",
  "IMPMAL.PowerWeapon": "Energetyczna",
  "Submit": "Zatwierdź",
  "Roll": "Rzuć"
}
```

**Use Cases:**
- **Differentiation cases**: English terms requiring different Polish translations
- **Undocumented labels**: UI elements not covered in official files
- **Override translations**: Custom translations replacing existing ones
- **General custom labels**: Additional translations for custom functionality

### Custom Labels Script (`scripts/use-custom-labels.ts`)

Handles **differentiation cases** where English terms have the same name but require different Polish translations:

```typescript
// Polish translation differentiates between "power" and "energy" weapons
IMPMAL.meleeTypes.power = 'IMPMAL.PowerWeapon';
```

The corresponding translation key is stored in `lang.json`:
```json
{
  "IMPMAL.PowerWeapon": "Energetyczna"
}
```

**Important**: Only use custom labels when absolutely necessary for Polish language differentiation. Avoid creating custom translations for items that already have proper translations in main packages.

## Guidelines

### When to Use Custom Package

1. **Differentiation Script**: Use `use-custom-labels.ts` for cases where English terms need different Polish translations
2. **Necessity First**: Only add custom translations when absolutely necessary for Polish language differentiation
3. **QoL Focus**: Custom scripts and styles should focus on quality of life improvements
4. **Non-Critical**: Custom additions should not be required for basic system functionality
5. **Documentation**: All custom additions should be properly documented
6. **Maintenance**: Custom code should be maintained and updated as the base system evolves

### What NOT to Add

- Translations already present in main packages
- Critical functionality required for basic operation
- Duplicate or conflicting translations
- Untested or experimental features

## Adding Custom Functionality

### 1. Create Directory Structure

```bash
mkdir -p src/packages/custom/{scripts,styles}
```

### 2. Add Custom Translations

Edit `lang.json` to add new translation keys:

```json
{
  "// custom keys which are not present in ImpMal system nor WH library": "",
  "IMPMAL.PowerWeapon": "Energetyczna",
  "Custom.NewFeature": "Nowa Funkcja"
}
```

### 3. Add Custom Scripts

Create TypeScript files in `scripts/` directory:

```typescript
// scripts/custom-enhancement.ts
export function initCustomEnhancement() {
  // Custom functionality
}
```

### 4. Add Custom Styles

Create SCSS files in `styles/` directory:

```scss
// styles/custom-enhancement.scss
.custom-enhancement {
  // Custom styling
}
```

Import additional styles in `styles/main.scss`:

```scss
@import 'custom-enhancement';
```

## Future Extensibility

The custom package is designed to be extended with additional functionality:

### Custom Scripts (`scripts/`)

Quality of Life (QoL) scripts that enhance user experience:
- **Not required for basic functionality**: These scripts are optional enhancements
- **User convenience**: Automate repetitive tasks or improve workflow
- **Custom game mechanics**: Additional features not present in the core system

### Custom Styles (`styles/`)

Custom CSS/SCSS files for visual enhancements:
- **UI improvements**: Better visual presentation of game elements
- **Accessibility**: Enhanced readability and user experience
- **Theme customization**: Optional visual themes or modifications

## Best Practices

### For Custom Translations
- Use comment keys (starting with `//`) to document the purpose of custom additions
- Keep custom translations minimal and focused
- Test translations in context within FoundryVTT

### For Custom Labels Script
- Use the script for differentiation cases only
- Add corresponding translation keys to `lang.json`
- Document the reason for differentiation in comments
- Test that the custom labels are applied correctly in the system

### For Custom Scripts
- Follow TypeScript best practices
- Include proper error handling
- Document any dependencies or requirements
- Test compatibility with different FoundryVTT versions

### For Custom Styles
- Use SCSS for better organization
- Follow BEM or similar naming conventions
- Ensure styles don't conflict with existing system styles
- Test across different themes and resolutions

## Integration

### Build Process Integration

The custom package is integrated into the main build process:

- **Translations**: Custom `lang.json` is automatically included in the final translation bundle
- **Scripts**: Custom scripts should be properly imported and bundled
- **Styles**: Custom styles should be compiled and included in the final CSS output

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Build errors | Ensure all custom files follow proper syntax and import patterns |
| Conflicts | Check for naming conflicts with existing system files |
| Compatibility | Test custom additions with the latest system versions |

### Getting Help
- Check existing issues on GitHub
- Review the main translation process documentation
- Contact the maintainer through GitHub issues

## Related Documentation

- [Translation Guide](translation-guide.md) - Main translation documentation
- [Package Development](package-development.md) - How to create and manage packages
- [Patching System](patching-system.md) - Template modification system 