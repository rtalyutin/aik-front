# AIK Frontend Tooling

This project uses Vite with React 18, ESLint, Prettier, and Node's built-in test runner.

## Available Commands

- `npm run dev` – start the Vite development server.
- `npm run build` – build the production bundle with Vite.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run ESLint with the React, Hooks, and a11y presets.
- `npm run format` – format the codebase with Prettier (single quotes, semicolons, 80 character width).
- `npm run test` – execute the Node.js test runner (`node --test`).
- `npm run deploy` – build the app and publish the contents of `dist/` to the configured server via `rsync`.

## Deployment

Run `npm run deploy` with the `DEPLOY_HOST`, `DEPLOY_USER`, and `DEPLOY_PATH` environment variables set. The script builds the project and uploads the optimized bundle from `dist/` instead of the raw `src/` files. Example:

```bash
DEPLOY_HOST=my.server.local \
DEPLOY_USER=deploy \
DEPLOY_PATH=/var/www/aik-front \
npm run deploy
```

For Nginx/CDN setups, ensure client-side routing falls back to the built index. The `deploy/nginx.conf` template configures `try_files` so that any unknown route resolves to `dist/index.html` while assets continue to be served directly from the `dist` folder.

## Quality Gates

All pull requests should pass the lint, format, and test commands before merging. Run the commands above locally or in CI to ensure compliance with the project's quality standards.
