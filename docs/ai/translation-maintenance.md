# Translation Maintenance

Use this playbook to synchronize, add, or review Polish translations. Keep language-file
maintenance separate from script and template patch maintenance.

## Translation Sources

| Package | Local file | Primary source |
|---------|------------|----------------|
| ImpMal | `src/packages/impmal/lang.json` | ImpMal English language file |
| WHLib | `src/packages/warhammer-library/lang.json` | Official WFRP4e Polish translation, then WHLib English structure |
| Custom | `src/packages/custom/lang.json` | Repository-specific additions and overrides |

The local Polish terminology should remain consistent with the Polish Imperium Maledictum
rulebook and existing translations.

## Synchronization Workflow

Run each phase separately and review its diff before continuing.

### 1. Establish a Baseline

1. Confirm that the working tree contains no unrelated changes.
2. Run the current build.

```bash
npm run build
```

3. Record the supported upstream versions before changing compatibility metadata.

### 2. Synchronize WFRP4e Translations

Run the WFRP4e synchronization first.

```bash
npm run sync wfrp4e
```

Review only the resulting WHLib language changes. Check whether imported terminology fits
Imperium Maledictum before accepting it.

### 3. Synchronize Upstream Structures

```bash
npm run sync source
```

This command currently reads the hardcoded upstream `master` ref. Treat its result as a
candidate structure, then verify new keys against the exact release being upgraded.

Review each package separately. Preserve existing Polish values where the English key is
unchanged.

### 4. Report Release Changes

```bash
npm run report
```

Run this before updating supported-version values. The report compares the current
supported version with the latest GitHub release and identifies changed language files,
scripts, and templates.

Inspect the complete output. Individual package errors can be logged without stopping all
remaining checks.

### 5. Complete Translations

For every added or changed key:

- Preserve key names and nesting.
- Preserve placeholders such as `{cost}` and template expressions.
- Preserve HTML tags and attributes.
- Reuse established terminology.
- Prefer an upstream localization key over a hardcoded Polish string when both produce the
  required result.
- Check grammar in the full sentence, not only the changed word.
- Keep repository-only keys in `src/packages/custom/lang.json`.

If a translation is uncertain, leave the current text unchanged and present the candidate
for review. Do not commit a guess merely to eliminate an English string.

Do not assume language JSON contains every user-facing string. Audit changed scripts and
templates through the patch workflow.

### 6. Validate

```bash
npm run build
```

Check the final diff for:

- untranslated English values;
- removed Polish values;
- changed placeholders;
- malformed HTML;
- unrelated formatting changes.

## Review Boundaries

Present these phases separately when they produce changes:

1. WFRP4e synchronization
2. Upstream language structure synchronization
3. Manual ImpMal translations
4. Manual WHLib translations
5. Custom translation changes
6. Script and template patches

Do not commit a phase until the user has reviewed it when review was requested.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Sync reports success but a package logged an error | Treat the package as unsynchronized and resolve the logged error |
| A synchronized value uses WFRP terminology that does not fit ImpMal | Adjust it after reviewing the surrounding ImpMal context |
| New upstream keys disappear from the report | Verify that supported versions were not updated before running the report |
| Placeholders changed during translation | Restore the exact original placeholder names and syntax |
| English remains outside `lang.json` | Audit changed scripts and Handlebars templates |

## Related Documentation

- [Translation Guide](../translation-guide.md) - Translation format and terminology rules
- [Upgrade and Patch Maintenance](upgrade-and-patch-maintenance.md) - Script and template audit
- [Repository Guidelines](repository-guidelines.md) - Standard commands and validation
