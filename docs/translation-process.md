# Translation Process for lang.json Files

## Overview

This document describes the process of translating `lang.json` files in the Imperium Maledictum System Translation project. The project translates FoundryVTT system files from English to Polish.

## Project Structure

The project is organized into packages, each containing its own `lang.json` file:

```
src/packages/
├── custom/
│   └── lang.json          # Custom translations
├── impmal/
│   └── lang.json          # ImpMal system translations
└── warhammer-library/
    └── lang.json          # Warhammer library translations
...other packages...
```

## Translation Sources

### Original Files
Each `lang.json` file corresponds to an original English file located at `static/lang/en.json` in the respective module's directory. The directory name matches the package name:

- `src/packages/impmal/lang.json` ↔ `impmal/static/lang/en.json`
- `src/packages/warhammer-library/lang.json` ↔ `warhammer-library/static/lang/en.json`

### Custom Translations
Custom translations that are not present in the original modules should be placed in `src/packages/custom/lang.json`. This includes:

- Custom text added by the translation team
- Undocumented labels that need translation
- Overrides for existing translations

Example from `custom/lang.json`:
```json
{
  "// custom keys which are not present in ImpMal system nor WH library": "",
  "IMPMAL.PowerWeapon": "Energetyczna",
  "Submit": "Zatwierdź",
  "Roll": "Rzuć"
}
```

## Translation Workflow

### 1. Identifying Translation Needs

The project includes automated tools to identify missing translations:

```bash
npm run report
```

This command checks for:
- Missing keys in local translations compared to remote sources
- Extra keys in local translations
- Modified translation files

### 2. Syncing with Remote Sources

To sync translations with remote repositories:

```bash
npm run sync wfrp4e
```

This updates the Warhammer library translations from the official WFRP4e Polish translation repository.

### 3. Building Translations

After making changes, build the project to combine all translations:

```bash
npm run build
```

This process:
1. Combines all `lang.json` files from packages
2. Filters out comment keys (starting with `//`)
3. Outputs the final translation to `dist/lang/pl.json`

## Translation Guidelines

### Key Naming Convention
- Use the same key structure as the original English file
- Maintain hierarchical structure (e.g., `IMPMAL.CHARGEN.Stages`)
- Preserve namespace prefixes (e.g., `IMPMAL.`, `WH.`)

### Translation Quality
- Maintain consistency with existing translations
- Use proper Polish grammar and terminology
- Follow the style established in the Podręcznik Gracza (Player's Handbook)
- Preserve HTML tags and formatting in rich text content

### Special Considerations

#### HTML Content
Many translation keys contain HTML markup. Preserve the structure while translating:

```json
{
  "IMPMAL.ApplyDutyContent": "<p>Zastosować tę Funkcję dla tej Postaci? Doda to określone Cechy, Umiejętności, Wpływy i Przedmioty</p>"
}
```

#### Placeholder Variables
Some translations contain placeholder variables in curly braces. Keep these unchanged:

```json
{
  "IMPMAL.BuyCost": "Kup ({cost})",
  "IMPMAL.CharacteristicTest": "Test {characteristic}"
}
```

#### Comments
Use comment keys (starting with `//`) to document custom additions:

```json
{
  "// custom keys which are not present in ImpMal system nor WH library": ""
}
```

## File Organization

### ImpMal System (`src/packages/impmal/lang.json`)
Contains translations for the core Imperium Maledictum system, including:
- Actor types (Character, NPC, Patron, Vehicle)
- Item types (Weapons, Armor, Talents, etc.)
- UI elements and interface text
- Game mechanics and rules text

### Warhammer Library (`src/packages/warhammer-library/lang.json`)
Contains translations for shared Warhammer functionality, including:
- Script system translations
- Effect and condition translations
- Common UI components
- Error messages and notifications

### Custom (`src/packages/custom/lang.json`)
Contains custom translations not present in original modules:
- Additional UI elements
- Custom game mechanics
- Override translations
- Undocumented labels

## Quality Assurance

### Automated Checks
The project includes several automated quality checks:

1. **Translation Completeness**: Checks for missing keys compared to source files
2. **Extra Keys**: Identifies custom additions
3. **File Structure**: Validates JSON format and structure

### Manual Review
Before committing translations:
1. Test translations in FoundryVTT
2. Verify context and meaning
3. Check for consistency with existing terminology
4. Ensure proper Polish grammar and spelling

## Contributing

When contributing translations:

1. **Fork the repository**
2. **Create a feature branch** for your changes
3. **Add translations** to the appropriate `lang.json` file
4. **Test your changes** in FoundryVTT
5. **Submit a pull request** with a clear description of changes

### Commit Messages
Use clear, descriptive commit messages:
- `feat: add missing ImpMal weapon translations`
- `fix: correct Polish grammar in character creation`
- `docs: update translation guidelines`

## Troubleshooting

### Common Issues

1. **Missing Translations**: Use `npm run report` to identify missing keys
2. **Build Errors**: Check JSON syntax and ensure all brackets are properly closed
3. **Inconsistent Terminology**: Refer to existing translations for consistency

### Getting Help
- Check existing issues on GitHub
- Review the README for installation and usage instructions
- Contact the maintainer through GitHub issues

## Related Files

- `tools/bundle-jsons.ts` - Combines all lang.json files
- `tools/commands/report/checks/translations.ts` - Translation validation
- `tools/commands/sync/sources/wfrp4e.ts` - Sync with WFRP4e translations
- `src/module.json` - Module configuration and language settings 