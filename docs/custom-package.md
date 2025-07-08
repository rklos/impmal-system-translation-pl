# Custom Package Documentation

## Overview

The `src/packages/custom/` directory serves as a container for custom additions that enhance the translation project beyond basic language files. This package is designed to be extended with quality-of-life improvements and custom functionality.

## Current Contents

### Custom Translations (`lang.json`)

Contains custom translation keys that are not present in the original modules. These should be used sparingly and only when necessary:

- **Differentiation cases**: When English terms have the same name but require different Polish translations
- **Undocumented labels**: UI elements or game mechanics not covered in official translation files
- **Override translations**: Custom translations that replace or enhance existing ones
- **General custom labels**: Additional translations for custom functionality

Example:
```json
{
  "// custom keys which are not present in ImpMal system nor WH library": "",
  "IMPMAL.PowerWeapon": "Energetyczna",  // Differentiates from other weapon types
  "Submit": "Zatwierdź",
  "Roll": "Rzuć"
}
```

### Custom Labels Script (`scripts/use-custom-labels.ts`)

Handles **differentiation cases** where English terms have the same name but require different Polish translations. This script applies custom labels to the system to make the translation more accurate.

Example of differentiation handling:
```typescript
// Polish translation differentiates between "power" and "energy" weapons.
IMPMAL.meleeTypes.power = 'IMPMAL.PowerWeapon';
```

The corresponding translation key is stored in `lang.json`:
```json
{
  "IMPMAL.PowerWeapon": "Energetyczna"
}
```

**Important**: Custom labels should only be used when absolutely necessary for Polish language differentiation. Avoid creating custom translations for items that already have proper translations in the main packages.

## Future Extensibility

The custom package is designed to be extended with additional functionality:

### Custom Scripts (`scripts/`)

Quality of Life (QoL) scripts that enhance the user experience:
- **Not required for basic functionality**: These scripts are optional enhancements
- **User convenience**: Automate repetitive tasks or improve workflow
- **Custom game mechanics**: Additional features not present in the core system

### Custom Styles (`styles/`)

Custom CSS/SCSS files for visual enhancements:
- **UI improvements**: Better visual presentation of game elements
- **Accessibility**: Enhanced readability and user experience
- **Theme customization**: Optional visual themes or modifications

## Guidelines for Custom Package Usage

1. **Differentiation Script**: Use `use-custom-labels.ts` for cases where English terms have the same name but require different Polish translations
2. **Necessity First**: Only add custom translations when absolutely necessary for Polish language differentiation
3. **QoL Focus**: Custom scripts and styles should focus on quality of life improvements
4. **Non-Critical**: Custom additions should not be required for basic system functionality
5. **Documentation**: All custom additions should be properly documented
6. **Maintenance**: Custom code should be maintained and updated as the base system evolves

## Adding to Custom Package

When adding new custom functionality:

1. **Create appropriate subdirectories** if they don't exist:
   ```
   src/packages/custom/
   ├── lang.json
   ├── scripts/
   │   └── your-script.ts
   └── styles/
       └── your-styles.scss
   ```

2. **Follow existing patterns** for file organization and naming
3. **Update documentation** to reflect new additions
4. **Test thoroughly** to ensure compatibility with the base system

## Integration with Build Process

The custom package is integrated into the main build process:

- **Translations**: Custom `lang.json` is automatically included in the final translation bundle
- **Scripts**: Custom scripts should be properly imported and bundled
- **Styles**: Custom styles should be compiled and included in the final CSS output

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

## Troubleshooting

### Common Issues
1. **Build Errors**: Ensure all custom files follow proper syntax and import patterns
2. **Conflicts**: Check for naming conflicts with existing system files
3. **Compatibility**: Test custom additions with the latest system versions

### Getting Help
- Check existing issues on GitHub
- Review the main translation process documentation
- Contact the maintainer through GitHub issues

## Related Files

- `docs/translation-process.md` - Main translation documentation
- `src/packages/custom/index.ts` - Custom package entry point
- `tools/bundle-jsons.ts` - Translation bundling process 