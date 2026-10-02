# Iya Gbenga's Store - Agent Instructions

## Project Context

Before making any changes to this project, read and understand:

- `PRD.md` — contains the complete product requirements and functionality.
- `designs/` — contains the approved UI/UX designs and should be treated as the source of truth for the visual implementation.

## Design Requirements

Follow the designs in `designs/` closely.

Do not redesign, reinterpret, or introduce a different visual direction unless explicitly requested.

Use the designs as the source of truth for:
- Layout
- Spacing
- Typography
- Colors
- Components
- Navigation
- Responsive behavior
- Page structure
- User flows

If a design and the PRD appear to conflict:
1. Identify the conflict.
2. Prefer the explicit functional requirement in `PRD.md`.
3. Preserve the visual design unless instructed otherwise.

## Development Rules

- Read `PRD.md` before implementing features.
- Inspect the relevant design before implementing UI.
- Do not build features that are not required by the PRD unless explicitly requested.
- Reuse existing components before creating new ones.
- Do not break existing functionality.
- Keep the code clean, modular, and maintainable.
- Use TypeScript properly.
- Keep secrets out of the client.
- Use environment variables for credentials and API keys.
- Test your changes before considering a task complete.

## Before Starting a Task

For every task:

1. Read the relevant section of `PRD.md`.
2. Inspect the relevant design files.
3. Inspect the existing implementation.
4. Determine what needs to change.
5. Implement the smallest complete solution.
6. Check for TypeScript, runtime, and UI issues.

## Important

Do not assume missing requirements.

If something is unclear, inspect the PRD, designs, and existing code first before making a decision.












<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
