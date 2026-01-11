---
description: Pre-commit checks for lint and build
---
// turbo-all

This workflow runs automatically before each commit via Husky pre-commit hooks.

## What It Does

The pre-commit hook runs the following checks:

1. **Lint Check** - Runs `lint-staged` which executes ESLint with `--fix --max-warnings 0` on staged `.js`, `.ts`, `.jsx`, `.tsx` files
2. **Build Check** - Runs `npm run build` to ensure the project compiles successfully

## Setup

The setup is already configured in the frontend:

- **Husky**: Configured in `frontend/.husky/pre-commit`
- **lint-staged**: Configured in `frontend/package.json`

## Manual Testing

To manually run the checks before committing:

```bash
cd frontend
npm run lint
npm run build
```

## Troubleshooting

If the pre-commit hook fails:

1. **Lint errors**: Fix the ESLint errors shown in the output
2. **Build errors**: Check TypeScript compilation errors and fix them
3. **Warnings**: With `--max-warnings 0`, even warnings will fail. Fix them or add appropriate eslint-disable comments with justification.

## Bypassing (Not Recommended)

In rare cases, you can bypass the hook with:

```bash
git commit --no-verify -m "Your message"
```

**Warning**: This should only be used in emergencies. The CI/CD pipeline will still fail if there are lint/build issues.
