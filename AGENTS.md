# Markdown style

- Do not use title case in markdown files. Use sentence case for headings.

# Commit messages

- Use sentence case for commit names and do not use conventional commits.
- Never commit unless explicitly requested.
- The agent may propose a commit name, but must wait for explicit user validation before using it.
- Always push commits automatically after creating them.

# Pull requests

- When creating or editing GitHub PR bodies, use real multiline text or a body file. Do not pass literal `\n` escape sequences in the PR description.
- Keep PR bodies short and focused on the change itself; do not add unnecessary sections like `Summary`, `Verification`, or `Notes` unless the user explicitly asks for them or they add essential context.
- Always squash-merge PRs unless the user explicitly asks for a different merge strategy.
- Always close or merge pull requests from GitHub.
- When merging a PR, delete the branch after merge unless it is still needed.
- When squash-merging a PR, use the subject format `Commit message (#pr_number)`.
- After a branch is merged, automatically pull `main` to keep the local branch up to date.

# css rules

- Always use CSS modules with Tailwind composition using `@apply`.
- Never use inline CSS or classes in component files.
- Prefer Tailwind utilities in CSS modules whenever Tailwind can express the style cleanly.
- Use Tailwind variants for pseudo-classes and media queries so the Stylelint rule can group them correctly.
- Use pure CSS only when Tailwind is awkward, unsupported, or less clear.
- When you use pure CSS, prefer theme values or existing design tokens.

<!-- BEGIN:nextjs-agent-rules -->
# This is not the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
