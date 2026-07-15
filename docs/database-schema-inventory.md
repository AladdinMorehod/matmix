# Database schema inventory (pre-migration)

The inventory was produced with `table_info`, `foreign_key_list`, `index_list`, `index_info` and `sqlite_master` against a copy of the production database. Pre-migration `user_version` is 0.

| Table | Keys and relationships | Lifecycle fields | Notes |
| --- | --- | --- | --- |
| `products` | integer PK `id`; unique, non-null `external_id` | `is_active`, `deleted_at`, created/updated/import timestamps | Category, subcategory and group are denormalized text. `image` and `image_url` are references, not entity IDs. |
| `catalog_structure` | integer PK; `parent_id -> catalog_structure.id` (NO ACTION); partial unique active category/subcategory names and external code | `is_active`, created/updated timestamps | Category/subcategory hierarchy; sort order is authoritative. |
| `users` | integer PK; unique, non-null `login` | `is_active`, `deleted_at`, created/updated timestamps | Roles and password hashes are unchanged. |
| `clients` | integer PK; non-null name and phone | created/updated and last-order timestamps | Phone lookup was unindexed. |
| `orders` | integer PK; partial unique `order_number`; nullable `client_id` | `deleted_at`, created/updated/taken/closed timestamps | `items_json` is the immutable historical item snapshot. No `order_items` table exists. |
| `order_events` | integer PK; non-null `order_id`, event type and message | `created_at` | Technical children of orders. |
| `catalog_import_logs` | integer PK | `created_at` | Immutable audit summaries and artifact paths; user identity is historical text/ID and intentionally not constrained. |
| session database `sessions` | text PK `sid` | expiry and updated timestamp | Separate store with no business relationships; not part of business FK graph. |

Version 1 recreates `orders` and `order_events` to add the two confirmed ID relationships. It does not create relationships for denormalized product structure text, order JSON snapshots, historical user/audit fields, or product images.

The source-copy audit found zero orders with missing clients, events with missing orders, subcategories with missing parents, active children under inactive parents, duplicate order numbers, duplicate product codes, or empty product codes. It found one legacy structure-like row without a structure code: the already classified pseudo-product 3670. That row is reported but deliberately does not block or get changed by this database migration. The migration has a deterministic rule for a nullable missing `orders.client_id`: it is copied as `NULL`, preserving the order. Missing event parents and structural parents are critical and block migration rather than being silently deleted. Legacy category codes 469/470 are unchanged.

The measured pre-migration plans used table scans for client phone, status-ordered orders and ordered events, plus temporary B-trees for ordering. Version 1 adds:

- `clients(phone)`;
- `orders(status, created_at DESC)` and `orders(client_id, created_at DESC)`;
- `order_events(order_id, created_at)`;
- product public state/order, category/subcategory/order, category/subcategory/group/order, and image-reference indexes.

The existing product unique constraint already indexes `external_id`; the redundant named unique index is removed. Existing catalog-structure indexes are retained because they cover type, parent, sort order and partial uniqueness.
