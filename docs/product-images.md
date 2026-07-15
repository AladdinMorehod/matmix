# Product images

New CRM uploads accept JPEG, PNG and WebP only after extension, MIME, signature and Sharp decoder validation. SVG, GIF, AVIF, BMP, TIFF, PDF, archives, HTML, empty and corrupt inputs are rejected. Multipart input is limited to 10 MiB. Decoder input is additionally limited to 40,000,000 pixels, 12,000 px on either side and one non-animated frame. These limits allow high-resolution product photography while bounding memory use independently of compressed file size.

Each accepted image is EXIF-auto-rotated, resized inside 1000×1000 without enlargement, converted to sRGB and written as WebP at quality 82. The public UI has no separate full-screen image viewer, so one variant avoids duplicate storage and reference complexity. Sharp does not copy EXIF, GPS, device, ICC or other input metadata into the result.

Files use `<MAT-or-product-id>-<first-16-hex-of-SHA256>.webp`. The user filename is never used for storage. Processing writes a random dot-prefixed temporary file inside `PRODUCT_UPLOADS_PATH`, verifies the result, fsyncs it and atomically renames it. The database is updated only afterward. On failure the temporary/new unreferenced file is removed and the previous image remains. Identical input for the same product reuses its content-addressed file.

Shared references remain supported: batch/filter assignment processes once and transactionally stores one URL for all products. Replacement or deletion removes the previous file only after its reference count reaches zero. The UI currently uses a text fallback rather than a physical placeholder file; therefore there is no shared placeholder asset to convert or delete. If a future file placeholder is introduced, its stable URL must be excluded from migration.

Content-addressed WebP files receive `Cache-Control: public, max-age=31536000, immutable`. Transitional legacy JPEG/PNG/WebP names retain a seven-day cache. Upload responses keep `nosniff`; directory indexes and nested paths remain disabled.

At most two Sharp jobs run concurrently in one process. Deployments with several Node workers must account for two jobs per worker. Keep `PRODUCT_UPLOADS_PATH` on a local filesystem that supports atomic rename and include it in the existing production backup.

## Existing files

Existing files are never converted at startup. With MatMix stopped, run:

```bash
npm run images:optimize -- --scan
npm run images:optimize -- --dry-run
npm run images:optimize -- --apply --confirm OPTIMIZE_MATMIX_IMAGES
```

Scan reports formats, bytes, dimensions, corrupt/oversized/orphan/missing files, symbolic links and shared references without changing data. Apply rejects symbolic links, refuses an active runtime lock, creates the standard verified DB/uploads backup, converts one shared URL at a time, transactionally updates all references, and deletes an original only after the commit and a zero-reference check. The JSON report is resumable: already content-addressed results are reused. After migration run backup verification and database health; on failure restore the pre-migration backup using the documented stopped-application restore procedure.
