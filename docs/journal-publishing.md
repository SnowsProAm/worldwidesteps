# Publishing the journal

The journal starts empty. `content/posts.json` is the editorial source, currently `[]`. No example posts or fabricated testimonials are published. No database or CMS deployment is required for local review.

Each brand owns its own file and design. Where Athletes Belong covers Events, Tournaments, Community, Athlete stories and Behind the scenes. World Wide Steps covers Step challenges, Walking, Community, Run clubs and Testimonials. Run-club stories belong to World Wide Steps.

## Author an entry

Add a record to `content/posts.json` with these fields:

- `slug`: unique lowercase words separated by hyphens. Published URL: `/blog/your-slug`.
- `status`: `draft` or `published`. Drafts and future publication dates are hidden.
- `title`, `excerpt`, `author`: real editorial copy and named authorship.
- `publishedAt`: ISO date/time. Optional `updatedAt` for revisions.
- `category`: one of this brand's exact categories above.
- `format`: `Article`, `Film` or `Testimonial`.
- Optional `sport`: the exact active ProAm sport ID for Where Athletes Belong filters.
- Optional `cover`: `{ "src": "/stories/your-photo.webp", "alt": "Describe the photograph", "caption": "Optional source/caption" }`.
- `body`: ordered blocks. Text blocks are `{ "type": "paragraph" | "heading" | "quote", "text": "..." }`. Quotes can include `attribution`. Images are `{ "type": "image", "src": "/stories/photo.webp", "alt": "...", "caption": "..." }`.
- Optional `video`: `url`, `title`, `description`, `thumbnail`, `uploadDate`, `duration` (ISO 8601), `transcript` and optional `captions` (a WebVTT URL). YouTube, YouTube Shorts and Vimeo links embed; HTTPS or local video files use the accessible native player. Every video needs a readable transcript; provide captions for uploaded speech videos.
- Testimonials also require `permissionConfirmed: true` after the team obtains permission. Put permission records in the appropriate private system, not this public JSON file. Never commit private emails, minor/student personal details or consent documents.

Put owned/approved media in `public/stories/` or use an approved HTTPS source. Include accurate alt text and source/rights captions. Do not publish a school endorsement or quote without the source's permission. There is no upload or publishing admin in this public site.

## Review and build

1. Write a draft and verify the facts, brand, source media, transcript and permission.
2. Run `npm test` and `npm run build`. A malformed published entry fails the build.
3. Mark the reviewed record `published`, with its real publication timestamp.
4. Review the page locally at `/blog/your-slug`, including phone layout and video alternatives.
5. Deploy the reviewed changes only when authorised. Confirm that the live story URL returns HTTP 200 and appears in the production sitemap.

The Vite journal plugin generates readable article HTML at build time, canonical links, descriptions, social metadata, BlogPosting JSON-LD and complete VideoObject metadata where provided. It includes only published, non-future entries in the generated sitemap. Filters combine topic, format, search and, on Where Athletes Belong, the live active-sport list. Text is escaped; arbitrary HTML and executable media URLs are not accepted.

The empty blog index is present in the sitemap. There are no invented Article, VideoObject, rating or testimonial records when the journal has no posts. Publishing a post requires a fresh build; this is a deliberate file-based editorial workflow, not live CMS automation.
