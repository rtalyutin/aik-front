# Repository Contribution Guidelines

## Formatting and Code Quality
- Always apply project-standard formatters (e.g., Prettier for JavaScript/TypeScript, ESLint fixes) before committing changes.
- Ensure code passes all relevant linters and static analysis tools configured in the project.
- Maintain consistent naming conventions and adhere to existing architectural patterns within the codebase.
- Use React with Vite as the foundational stack to preserve the fast development cycle of the application.
- Adopt a feature-oriented project structure: every feature block owns its UI component and accompanying JSON configuration.
- Share reusable UI components via dedicated common component directories; do not duplicate shared UI code across features.
- Keep the `src/` layout aligned with the following baseline: `App.jsx` as the root component, `main.jsx` as the entry point, `components/` for shared blocks, `features/` for feature folders (each containing a component and `config.json`), and `styles/` for global styling assets.
- Enforce a combined Prettier + ESLint toolchain to guarantee consistent style and quality.
- Within each feature folder, include both a React component and a `config.json` file, and import the configuration via standard ES module syntax inside the component.
- When introducing a new block, duplicate an existing feature folder as a starting point to maintain structure consistency.
- Apply the recommended ESLint rule sets for React, hooks, and accessibility, and run `npm run lint` and `npm run format` regularly.
- Store styles shared across multiple blocks in common style files, while keeping feature-specific styles co-located with their components.
- Avoid consolidating all styles into a single file; the shared stylesheet should contain only truly common rules to reduce coupling and ease maintenance.

## File and Asset Management
- Do not commit build artifacts, binaries, or generated files (e.g., `dist/`, `build/`, `.exe`, `.dll`, `.zip`).
- Large media assets or datasets should be stored using appropriate tooling (e.g., object storage, CDN) and referenced rather than committed directly.
- Keep secrets, API keys, and sensitive configuration files out of version control. Use environment variables or secret management solutions instead.

## Documentation and Testing
- Update documentation (README, inline comments) when behavior or configuration changes.
- Provide unit and integration tests for new features or logic changes, ensuring existing test suites continue to pass.
- For configuration-only or documentation changes, run at least basic linting to verify there are no regressions.

## Pull Request Expectations
- Use Conventional Commits for commit messages and follow the repository's branch naming conventions.
- Include a clear summary of changes, testing performed, and any deployment considerations in the PR description.
- Request a human review for all changes and address feedback promptly.
