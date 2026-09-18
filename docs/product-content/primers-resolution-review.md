# Грунтовки — resolution pass

Дата: 18.09.2026. Проверены local DB identity fields, source=excel, slugs, categories, historical repo/import artifacts and local snapshots. Ничего не записывалось в БД.

## Summary

- IDENTITY_RESOLVED: 2
- PARTIALLY_RESOLVED: 2
- IDENTITY_BLOCKED: 5

| MAT | current title | canonical identity | package | source URLs | identity status | title status | inventory discrepancy | core readiness |
|---|---|---|---|---|---|---|---|---|
| MAT-000234 | Грунт Litokol PRIMER A универсальный укрепляющий 10 л | LITOKOL Primer A, exact product family confirmed; package unit remains unresolved | official 10 kg; local title 10 l | [source](https://www.litokol.ru/catalog/primer-a/) | PARTIALLY_RESOLVED | POSSIBLE_ERROR | products.weight=10 matches numeric local quantity but unit is not independently proven; official package is kg, title is l | Identity/facts usable except package_volume and unit guard |
| MAT-000237 | Грунтовка Oscar глубокого проникновения 10 л | Oscar G os-10kg, latex deep-penetration primer; exact family supported by brand support | official support 10 kg; local title 10 l | [source](https://support.alaxar.ru/produktsiya/katalog/gruntovka-2/dlya-naruzhnyh-rabot.html)<br>[source](https://moscow.petrovich.ru/product/622085/) | PARTIALLY_RESOLVED | POSSIBLE_ERROR | products.weight=10 matches numeric local quantity but unit is not independently proven; official package is kg, title is l | Identity/facts usable except package_volume and unit guard |
| MAT-000243 | Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг | Forbo Eurocol 044 Europrimer Multi | official 10 kg | [source](https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw) | IDENTITY_RESOLVED | MATCH | products.weight=3 conflicts with exact title and official 10 kg package; likely corrupted/stale inventory field, but no source proves why it is 3 | Identity and package resolved; products.weight remains untouched |
| MAT-000244 | Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг | Forbo Eurocol 041 Europrimer EC | official 10 kg | [source](https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag) | IDENTITY_RESOLVED | MATCH | products.weight=3 conflicts with exact title and official 10 kg package; likely corrupted/stale inventory field, but no source proves why it is 3 | Identity and package resolved; products.weight remains untouched |
| MAT-000229 | Грунтовка Knauf Тифенгрунд морозостойкая (до -40) 10 л | KNAUF Tiefengrund family only; exact “морозостойкая до -40” SKU not proven | local title 10 l; official family page lists 5/10 kg and optional frost resistance but no exact -40 SKU | [source](https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/) | IDENTITY_BLOCKED | POSSIBLE_ERROR | products.weight=10 is only local numeric context | Do not seed this MAT until exact SKU/package proof |
| MAT-000238 | Грунтовка Акрил 5 л | не установлена | 5 l only from local title | — | IDENTITY_BLOCKED | IDENTITY_CONFLICT | products.weight=5 is only local numeric context | No core or image write |
| MAT-000239 | Грунтовка Акрил 10 л | не установлена | 10 l only from local title | — | IDENTITY_BLOCKED | IDENTITY_CONFLICT | products.weight=10 is only local numeric context | No core or image write |
| MAT-000259 | Грунт ГФ-021 по металлу и дереву серый 0,8 кг | не установлена | 0.8 kg only from local title | [source](https://prestige-holding.ru/upload/%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5%20%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D1%8F%20%D1%81%D0%B5%D0%B3%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%2020-178%20%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F%2016%20%2820-178%29.pdf) | IDENTITY_BLOCKED | IDENTITY_CONFLICT | products.weight=1 conflicts numerically with title 0.8 kg; no manufacturer or SKU proves either value | No core or image write |
| MAT-000260 | Грунт по металлу серый 1 л | не установлена | 1 l only from local title | — | IDENTITY_BLOCKED | IDENTITY_CONFLICT | products.weight=1 is only local numeric context | No core or image write |

## Conclusions

- MAT-000234: family identity is supported by official LITOKOL, but 10 кг versus local 10 л remains unresolved.
- MAT-000237: Oscar G os-10kg is supported by brand documentation, but local 10 л versus official 10 кг remains unresolved.
- MAT-000243/244: exact Forbo 044/041 identities and 10 кг packages are confirmed; local products.weight=3 is an inventory discrepancy and was not changed.
- MAT-000229: KNAUF Tiefengrund family is known, but the exact frost-resistant до -40 SKU is not proven.
- MAT-000238/239/259/260: no safe manufacturer/model identity was recovered; they remain blocked.

## Policy

Titles, slugs, products.weight, brand, images, content and prices were not changed. No resolution row is eligible for automatic write until its exact guard and source gaps are closed.
