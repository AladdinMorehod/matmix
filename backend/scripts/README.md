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

# Резервное копирование и восстановление

## Проверка механизма backup/restore

Команда:

    npm run backup:verify-restore

Проверяет создание копии, восстановление, rollback, контрольные суммы, блокировки и защиту от небезопасных путей.

## Репетиция восстановления внешней копии

Команда:

    npm run backup:rehearse-offsite

Скрипт скачивает последнюю копию из зашифрованного rclone remote, восстанавливает её только во временные пути, проверяет базу и uploads, затем удаляет временные файлы. Production не изменяется.

Для конкретной копии укажи её реальное имя, например:

    npm run backup:rehearse-offsite -- matmix-backup-2026-07-22T03-30-28-546Z-97605dde
