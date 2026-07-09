# Catalog maintenance fixes

## Command

```bash
npm run catalog:fixes
```

## Purpose

Applies safe point fixes to the product catalog after Excel imports.

The script:
- creates a database backup in `backend/database/backups/`;
- applies all registered catalog fixes;
- prints a per-rule report;
- runs `PRAGMA integrity_check`.

## Current fixes

- `plywood-groups` — fixes product groups for plywood items in the `Фанера` subcategory.

## Adding new fixes

1. Add a new object to `catalogFixes` in `apply-catalog-fixes.js`.
2. Describe `match(product)` for products the fix should inspect.
3. Describe `update(product)` for the fields that should change.
4. The script will create the backup and report automatically.
