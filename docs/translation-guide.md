# Translation Guide

This guide explains how to translate and maintain language files in the FoundryVTT System Translation project.

## Overview

The project translates FoundryVTT modules from English to Polish using JSON language files. Each package has its own `lang.json` file that gets combined into a single translation bundle.

## Translation Files

### Package Structure

```
src/packages/
├── {core-system}/lang.json       # Core system translations
├── warhammer-library/lang.json   # Shared Warhammer functionality
└── custom/lang.json              # Custom translations
```

### File Format

Translation files use JSON format with key-value pairs:

```json
{
  "// comment": "Documentation comment",
  "SYSTEM.ActorType": "Typ Aktora",
  "WH.Script": "Skrypt",
  "SYSTEM.BuyCost": "Kup ({cost})"
}
```

## Translation Guidelines

### Key Naming
- Use the same key structure as the original English file
- Maintain namespace prefixes (e.g., `SYSTEM.`, `WH.`)
- Preserve hierarchical structure

### Content Rules
- Use proper Polish grammar and terminology
- Follow the style established in the Podręcznik Gracza
- Preserve HTML tags and formatting
- Keep placeholder variables unchanged (e.g., `{cost}`, `{characteristic}`)

### Special Cases

#### HTML Content
Preserve HTML structure while translating:

```json
{
  "SYSTEM.ApplyDutyContent": "<p>Zastosować tę Funkcję dla tej Postaci? Doda to określone Cechy, Umiejętności, Wpływy i Przedmioty</p>"
}
```

#### Comments
Use comment keys (starting with `//`) to document custom additions:

```json
{
  "// custom keys not present in original modules": ""
}
```

## Workflow

### 1. Check Missing Translations

```bash
npm run report
```

This identifies:
- Missing keys compared to source files
- Extra keys in local translations
- Modified translation files

### 2. Sync with Official Sources

```bash
npm run sync wfrp4e
```

Updates Warhammer library translations from the official WFRP4e Polish repository.

### 3. Build Translations

```bash
npm run build
```

Combines all `lang.json` files into `dist/lang/pl.json`, filtering out comment keys.

## Custom Translations

Use `src/packages/custom/lang.json` for translations not present in original modules:

- **Differentiation cases**: When English terms need different Polish translations
- **Undocumented labels**: UI elements not covered in official files
- **Override translations**: Custom translations that replace existing ones

Example:
```json
{
  "// custom keys which are not present in core system nor WH library": "",
  "SYSTEM.PowerWeapon": "Energetyczna",
  "Submit": "Zatwierdź"
}
```

## Quality Assurance

### Before Committing
1. Test translations in FoundryVTT
2. Verify context and meaning
3. Check consistency with existing terminology
4. Ensure proper Polish grammar and spelling

### Automated Checks
- Translation completeness validation
- JSON format verification
- Extra key identification

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| Missing translations | Run `npm run report` to identify gaps |
| Build errors | Check JSON syntax and bracket matching |
| Inconsistent terms | Refer to existing translations for consistency |

### Getting Help
- Check existing GitHub issues
- Review the [Package Development](package-development.md) guide
- Contact maintainers through GitHub issues

## Related Documentation

- [Package Development](package-development.md) - How to create and manage packages
- [Custom Package](custom-package.md) - Custom functionality guidelines
- [Patching System](patching-system.md) - Template modification system 