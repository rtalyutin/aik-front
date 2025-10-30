# AIK Frontend Tooling

This project uses Vite with React 18, ESLint, Prettier, and Node's built-in test runner.

## Available Commands

- `npm run dev` – start the Vite development server.
- `npm run build` – build the production bundle with Vite.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run ESLint with the React, Hooks, and a11y presets.
- `npm run format` – format the codebase with Prettier (single quotes, semicolons, 80 character width).
- `npm run test` – execute the Node.js test runner (`node --test`).

## Quality Gates

All pull requests should pass the lint, format, and test commands before merging. Run the commands above locally or in CI to ensure compliance with the project's quality standards.
