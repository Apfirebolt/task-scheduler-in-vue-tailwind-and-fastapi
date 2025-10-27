---
name: git-workflow
description: Best practices for branching, committing and creating pull requests in Git.
---

# Git Workflow Skill

This skill outlines a consistent Git workflow for multi‑agent development.  Use it whenever the `@reviewer` agent manages branches and commits or when writing commit messages manually.

## Branch naming conventions

- Prefix feature branches with `feat/` (e.g. `feat/add‑priority-field`).
- Prefix bug fixes with `fix/` (e.g. `fix/null-pointer-on-login`).
- Use `chore/` for maintenance or tooling changes and `docs/` for documentation updates.
- Keep branch names concise; separate words with hyphens.

## Commit message guidelines

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) style: `<type>: <summary>`.  The summary is written in the imperative mood (e.g. `feat: add priority field to tasks`).
- Keep the summary under 50 characters when possible.
- Provide additional context in the commit body if needed, separated from the summary by a blank line.
- Avoid committing generated files or secrets.  Use `.gitignore` appropriately.

## Pull request best practices

- Open a pull request only after the test suite passes.  The PR title should mirror the commit summary.
- In the PR description, explain *why* the change is necessary, *what* has been done and any *follow‑up tasks*.
- Link to relevant issues or tickets.  Mention documentation updates if applicable.

## Additional tips

- Configure your Git user name and email before committing.  Use environment variables or global config if running inside a container.
- Rebase frequently against the main branch to avoid merge conflicts.  Resolve conflicts locally before pushing.
- Delete feature branches after they are merged to keep the repository tidy.
