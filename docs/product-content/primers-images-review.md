# Грунтовки — image preparation review

Проверка выполнена локально 2026-09-18. Production не читался и не изменялся. `product-images-batch/primers/` остаётся рабочей untracked-папкой; approved image assets не добавляются в Git автоматически.

## Policy

Изображение допускается только при доказанной exact identity, фасовке и отсутствии водяного знака. Existing real production images для MAT-000228 и MAT-000232 сохраняются без замены. Для остальных товаров clean exact local source не был принят, поэтому финальные файлы не создавались.

## Summary

| Status | Count | MAT |
|---|---:|---|
| EXISTING_REAL | 2 | MAT-000228, MAT-000232 |
| READY_PREPARED | 0 | — |
| SOURCE_BLOCKED | 9 | MAT-000230, MAT-000231, MAT-000233, MAT-000235, MAT-000236, MAT-000241, MAT-000242, MAT-000243, MAT-000244 |
| VARIANT_UNCLEAR | 4 | MAT-000227, MAT-000234, MAT-000237, MAT-000240 |

## Per-MAT review

Полные source URLs, identity notes и поля dimensions/format/file size находятся в [primers-images-review.json](./primers-images-review.json). У `EXISTING_REAL` production source не запрашивался из-за запрета на production access; этот статус основан на принятом production audit.

### Blocked decisions

- **MAT-000227** — официальный источник подтверждает 5 кг, а локальный title содержит 5 л; нельзя конвертировать единицы или брать изображение другой фасовки.
- **MAT-000234** — официальный Primer A указан как 10 кг, локальный title — 10 л; exact image/package match не доказан.
- **MAT-000237** — Oscar G os-10kg подтверждён как 10 кг, локальный title — 10 л; exact image match отложен.
- **MAT-000240** — KNAUF Mittelgrund source подтверждает 10 кг, локальный title — 10 л; exact image match отложен.
- **SOURCE_BLOCKED** rows — product identity known, но clean exact source image не сохранён и не проверен по dimensions/watermark.

## Future importer dry-run

```text
node backend/scripts/import-product-images.js --input product-images-batch/primers/import-ready --db backend/database/matmix.db --only MAT-000227,MAT-000228,MAT-000230,MAT-000231,MAT-000232,MAT-000233,MAT-000234,MAT-000235,MAT-000236,MAT-000237,MAT-000240,MAT-000241,MAT-000242,MAT-000243,MAT-000244 --dry-run
```

Команда только подготовлена; importer и БД не запускались и не менялись.
