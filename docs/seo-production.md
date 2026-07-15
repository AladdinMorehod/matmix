# SEO production configuration

MatMix uses a hybrid Express architecture: `/` and `/catalog` retain the existing interactive application, while category, subcategory and product URLs return complete server-rendered HTML that works without JavaScript.

Required deployment variables:

```text
PUBLIC_BASE_URL=https://example.com
SEO_ALLOW_INDEXING=true
SITE_NAME=MatMix
DEFAULT_OG_IMAGE=/img/logo-burgundy.png
```

`PUBLIC_BASE_URL` must be a plain HTTP(S) origin without credentials, path, query or fragment. Production should use HTTPS. When indexing is enabled it is mandatory. `SEO_ALLOW_INDEXING` defaults to disabled; an unset production value emits a warning. Disabled indexing gives every generated page `noindex,nofollow`, returns `Disallow: /` from robots and disables sitemap.

Canonical public URLs are `/`, `/catalog`, `/catalog/category/CAT-CODE`, `/catalog/category/CAT-CODE/SUB-CODE`, and `/product/MAT-CODE`. Codes are stable business identifiers, so renaming display text does not change URLs. Codes are looked up case-insensitively and non-canonical casing redirects permanently. `/index.html` and `/catalog.html` redirect to canonical paths. Search stays at `/catalog?search=...`, is `noindex,follow`, and is excluded from sitemap.

Product HTML includes its title, MAT code, catalog hierarchy, price or “Цена по запросу”, available factual fields, description when present, image/fallback, breadcrumbs and a catalog/cart link. Product and BreadcrumbList JSON-LD are emitted with HTML/JSON escaping and a per-response CSP nonce. Offer uses RUB and is included only for a positive stored price; no availability, rating or review is invented. Category pages include child subcategory links and up to 40 ordered product links per page, with ordinary previous/next links and a page-specific canonical.

`/sitemap.xml` is generated from active, non-deleted entities and excludes CRM, API, search, inactive/deleted products and legacy pseudo-record 3670. `lastmod` is emitted only from stored timestamps. A deployment must add a sitemap index before the catalog exceeds 50,000 URLs. `/robots.txt` allows public pages, blocks API/login/manager/search and advertises the configured sitemap. Both have short caches.

Deployment checklist:

1. Set the canonical HTTPS origin and explicitly enable indexing only in production.
2. Run `npm run test:seo` and existing regressions on a database copy.
3. Start the deployment and inspect robots, sitemap, one category and one product with plain HTTP/no JavaScript.
4. Validate Product and BreadcrumbList JSON-LD and verify canonical/OG URLs use the production host.
5. Submit the sitemap in search-engine tooling.

After a domain change, update `PUBLIC_BASE_URL`, restart, clear edge caches and recheck canonical, OG, robots and sitemap. Do not change CAT/SUB/MAT public identifiers. If URL rules must change, retain permanent redirects from every old canonical URL.
