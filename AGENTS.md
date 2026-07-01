# Markdown style

- Do not use title case in markdown files. Use sentence case for headings.

# Commit messages

- Use sentence case for commit names and do not use conventional commits.
- Never commit unless explicitly requested.
- Always ask the user for confirmation before choosing a commit name.
- Always push commits automatically after creating them.

# Pull requests

- When creating or editing GitHub PR bodies, use real multiline text or a body file. Do not pass literal `\n` escape sequences in the PR description.
- Keep PR bodies short and focused on the change itself; do not add unnecessary sections like `Summary`, `Verification`, or `Notes` unless the user explicitly asks for them or they add essential context.
- Always squash-merge PRs unless the user explicitly asks for a different merge strategy.
- When merging a PR, delete the branch after merge unless it is still needed.
- When squash-merging a PR, use the subject format `Commit message (#pr_number)`.
- After a branch is merged, automatically pull `main` to keep the local branch up to date.

# css rules

- Prefer Tailwind utilities in CSS modules whenever Tailwind can express the style cleanly.
- Split different concerns into separate `@apply` lines.
- One `@apply` line must contain only one concern.
- Multiple utilities are allowed on the same `@apply` line only when they belong to that same concern.
- Never combine different concerns on one `@apply` line, even if the selector is short.
- Keep interaction states and responsive overrides in the same selector when Tailwind shorthand keeps them clear, but still on their own `@apply` lines.
- Use pure CSS only when Tailwind is awkward, unsupported, or less clear.
- When you use pure CSS, prefer theme values or existing design tokens.

Required structure:

```css
.selector {
  @apply <layout>;
  @apply <spacing>;
  @apply <borders-and-radius>;
  @apply <typography>;
  @apply <color-and-background>;
  @apply <shadows-and-effects>;
  @apply <transitions-and-motion>;
  @apply <interaction-states>;
  @apply <responsive-overrides>;
}
```

<!-- BEGIN:nextjs-agent-rules -->
# This is not the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
