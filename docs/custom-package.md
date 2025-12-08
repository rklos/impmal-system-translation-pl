# Custom Package

The custom package (`src/packages/custom/`) contains translations and functionality not present in original modules.

## Custom Translations

Add translations to `lang.json` for:

- **Differentiation cases** - English terms needing different Polish translations
- **Undocumented labels** - UI elements not in official files
- **Override translations** - Custom replacements for existing translations

Example:

```json
{
  "// custom keys not present in core system": "",
  "SYSTEM.PowerWeapon": "Energetyczna",
  "Submit": "Zatwierdź"
}
```

## Custom Labels Script

Use `scripts/use-custom-labels.ts` for differentiation cases where English terms need different Polish translations:

```typescript
// Polish differentiates between "power" and "energy" weapons
SYSTEM.meleeTypes.power = 'SYSTEM.PowerWeapon';
```

Only use custom labels when necessary for Polish language differentiation.

## Adding Custom Content

### Translations

Edit `lang.json`:

```json
{
  "Custom.NewFeature": "Nowa Funkcja"
}
```

### Scripts

Create files in `scripts/`:

```typescript
// scripts/custom-enhancement.ts
export function initCustomEnhancement() {
  // Custom functionality
}
```

### Styles

Create files in `styles/` and import in `main.scss`:

```scss
// styles/main.scss
@import 'custom-enhancement';
```

## Guidelines

- Only add translations when necessary for Polish differentiation
- Focus on quality-of-life improvements
- Avoid duplicating translations from main packages
- Test custom additions thoroughly

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build errors | Check file syntax and import patterns |
| Conflicts | Check for naming conflicts with system files |
| Compatibility | Test with latest system versions |

## Related Documentation

- [Translation Guide](translation-guide.md) - Translation workflow
- [Package Development](package-development.md) - Package management
