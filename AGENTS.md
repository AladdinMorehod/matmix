# MatMix Agent Instructions

## Scope and priorities

* These instructions apply to the entire repository.
* Data safety, production stability, and preservation of existing behavior take priority over implementation speed.
* Prefer the smallest task-specific change.
* Fix root causes rather than masking symptoms.

## Git workflow

* Never work directly on or commit directly to `main`.
* Use a separate clearly named branch for every task.
* One logical task must correspond to one branch and one Pull Request.
* Do not create branches, commits, push changes, or create Pull Requests unless the user explicitly authorizes that action.
* Never force-push, rewrite history, or perform destructive resets.

## Before making changes

* Inspect all files related to the task.
* Identify the probable root cause.
* Present a short implementation plan before editing.
* When requirements are materially ambiguous, explain the ambiguity before making changes.
* Do not expand the task scope without explicit approval.

## Forbidden files and data

Do not modify, add, delete, stage, or commit:

* `node_modules/`
* `server-backups/`
* `test-results/`
* uploads and user-generated files
* production databases
* `.env` files
* credentials, tokens, SSH keys, certificates, or other secrets
* logs and temporary files

Existing unrelated modified or untracked files must remain untouched.

## Production access

* Never request or use access to the production server.
* Never request or use production SSH credentials or deployment keys.
* Never access `/etc/matmix/matmix.env`.
* Never modify production databases or production uploads.
* Never perform a production deployment.
* Production deployment is handled separately after review and merge.

## Protected areas

Do not modify these areas without separate explicit authorization:

* dependencies in `package.json`
* `package-lock.json`
* `deploy/`
* Nginx configuration
* systemd configuration
* backup and restore implementation
* database schema and migrations
* production infrastructure and runtime paths

## Prohibited operations

Never run:

* `npm audit fix --force`
* forced major dependency upgrades
* destructive database operations
* destructive file deletion commands
* force push
* history rewriting

Do not remove existing functionality merely to simplify an implementation.

## Implementation principles

* Keep the diff minimal and directly related to the task.
* Preserve existing public and CRM behavior unless the requested change explicitly requires otherwise.
* Follow existing code conventions.
* Avoid broad refactoring during bug fixes.
* Do not silently introduce fallback behavior that hides errors.
* Consider duplicated public markup in `public/index.html` and `public/catalog.html`.
* Treat `public/js/script.js`, `backend/routes/products.js`, and `backend/routes/orders.js` as high-risk files because of their size and broad responsibilities.
* Treat CRM global script ordering as sensitive.

## Verification

Before reporting a task as complete:

* inspect `git status`;
* inspect the complete `git diff`;
* verify that only task-related files changed;
* run `git diff --check`;
* run the tests appropriate to the affected area;
* report tests that passed;
* report tests that were not run and explain why.

Do not claim a test passed unless it was actually executed successfully.

## Visual change checklist

For public-site or CRM visual changes, verify where applicable:

* desktop layout;
* mobile layout;
* horizontal overflow;
* long text;
* images and image fallbacks;
* buttons and forms;
* loading states;
* error states;
* empty states;
* neighboring components;
* both `public/index.html` and `public/catalog.html` when shared cart or checkout markup is involved.

## Task report

At the end of every implementation task, report:

* root cause;
* changed files;
* summary of changes;
* tests and checks executed;
* tests not executed;
* remaining risks;
* exact manual verification steps.
