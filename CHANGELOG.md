# Changelog

## [Unreleased] - 2026-01-29

### Removed
- **Database**: Eliminated `sku` column from `producto` table.
- **Frontend**: Removed SKU column from Inventory table, filter options, export function, and product modal form.
- **Backend**: Removed `sku` field from `Producto` model and controller logic (create/update).

### Added
- **Migration**: Added `migrations/001_remove_sku_column.sql` for schema update.
- **Scripts**: Added `scripts/backup_products.js` (JSON backup) and `scripts/migrate_remove_sku.js` (migration execution).
