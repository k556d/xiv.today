# Markdown style

- Do not use title case in markdown files. Use sentence case for headings.

# Commit messages

- Use sentence case for commit names and do not use conventional commits.
- Never commit unless explicitly requested.
- Always ask the user for confirmation before choosing a commit name.
- Always push commits automatically after creating them.

# Pull requests

- When creating or editing GitHub PR bodies, use real multiline text or a body file. Do not pass literal `\n` escape sequences in the PR description.
- When merging a PR, delete the branch after merge unless it is still needed.
- When squash-merging a PR, use the subject format `Commit message (#pr_number)`.
- After a branch is merged, automatically pull `main` to keep the local branch up to date.

<!-- BEGIN:nextjs-agent-rules -->
# This is not the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
