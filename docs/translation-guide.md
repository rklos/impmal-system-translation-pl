# Translation Guide

This guide explains how to translate and maintain language files in the project.

## Translation Files

Each package has a `lang.json` file with translations:

```
src/packages/
├── {core-system}/lang.json
├── warhammer-library/lang.json
└── custom/lang.json
```

### File Format

```json
{
  "// comment": "Documentation comment",
  "SYSTEM.ActorType": "Typ Aktora",
  "SYSTEM.BuyCost": "Kup ({cost})"
}
```

## Translation Rules

### Keys

- Use the same key structure as the original English file
- Maintain namespace prefixes (e.g., `SYSTEM.`, `WH.`)

### Content

- Use proper Polish grammar and terminology
- Follow the style from Podręcznik Gracza
- Preserve HTML tags and formatting
- Keep placeholder variables unchanged (e.g., `{cost}`)

### Comments

Use comment keys to document custom additions:

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

Identifies missing keys, extra keys, and modified files.

### 2. Sync with Official Sources

```bash
npm run sync wfrp4e
```

Updates Warhammer library translations from the official WFRP4e Polish repository.

### 3. Build Translations

```bash
npm run build
```

Combines all `lang.json` files into `dist/lang/pl.json`.

## Custom Translations

Use `src/packages/custom/lang.json` for translations not in original modules. See [Custom Package](custom-package.md) for details.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Missing translations | Run `npm run report` to identify gaps |
| Build errors | Check JSON syntax and bracket matching |
| Inconsistent terms | Refer to existing translations |

## Related Documentation

- [Package Development](package-development.md) - Package creation and management
- [Custom Package](custom-package.md) - Custom functionality guidelines
