# Documentation Maintenance

Use this playbook when adding or revising Markdown documentation or AI instructions.

## Documentation Roles

- `README.md` explains the module to users.
- `docs/` contains human-facing development guides.
- `docs/ai/` contains repeatable task instructions for AI agents.
- `AGENTS.md` provides automatic routing and concise repository-wide constraints.

Do not duplicate a detailed procedure across these locations. Link to its source instead.

## Writing Rules

- Use clear language suitable for a junior contributor.
- Write instructions in second person and active voice.
- Use one idea per sentence.
- Start sequential actions with a verb and use numbered lists.
- Use kebab-case file names.
- Use one `#` title and do not skip heading levels.
- Add a language to every code block.
- Use relative links for repository documentation.
- Include expected results when a command's success is not obvious.
- Add a troubleshooting table when the workflow has known failure modes.
- End guide documents with a related-documentation section.

## AI Instruction Rules

- Include only guidance that changes future behavior.
- Verify commands, paths, versions, and architecture against the repository.
- Prefer task-specific procedures over broad engineering advice.
- State success criteria and required validation.
- Describe current limitations without narrating a past work session.
- Keep global personal preferences in the user-level `AGENTS.md`.
- Keep repository facts in the root `AGENTS.md` or a linked playbook.
- Never add private plans, temporary notes, credentials, or secrets.

## Update Workflow

1. Identify the single document responsible for the topic.
2. Read related documents and instruction files.
3. Verify claims against current code and configuration.
4. Make the smallest self-contained update.
5. Add or update navigation links.
6. Check headings, code-block languages, and relative links.
7. Run whitespace validation.

```bash
git diff --check
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Two documents explain the same procedure | Keep the detail in one file and replace the duplicate with a link |
| An AI instruction conflicts with current code | Verify intended behavior, then update the stale instruction |
| A new playbook is difficult to discover | Add it to `docs/ai/README.md` and route it from `AGENTS.md` if necessary |
| Documentation contains temporary branch details | Remove them and state the durable rule independently |

## Related Documentation

- [AI Instruction Library](README.md) - Instruction routing and maintenance
- [Documentation Hub](../README.md) - Human-facing documentation index
- [Repository Guidelines](repository-guidelines.md) - Project sources of truth
