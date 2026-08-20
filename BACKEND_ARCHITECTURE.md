# Perissos CMS Backend Architecture

## Overview

The backend is built on **Payload CMS** (headless CMS) with **PostgreSQL** as the database, running inside a Next.js monorepo. The admin panel (`apps/backoffice`) provides a drag-and-drop interface using **Payload Blocks** for content creation. The frontend (`apps/frontend`) consumes the API and renders content using pre-built **UI sections**.

---

## Core Stack

| Layer | Technology |
|---|---|
| CMS | Payload v2.0 |
| Database | PostgreSQL (via `postgresAdapter`) |
| Object Storage | R2 (S3-compatible) |
| API | Payload REST/GraphQL API |
| Frontend | Next.js 14 (app router) |
| UI Components | React components in `packages/ui` |
| Shared Utils | Types & utils in `packages/shared` |

---

## Database Schema (Collections)

| Collection | Slug | Key Fields | Description |
|---|---|---|---|
| **Users** | `users` | `email`, `name`, `role` ('admin' \| 'editor') | Auth users for the backoffice |
| **Media** | `media` | `filename`, `mimeType`, `filesize`, `url`, `alt`, `caption` | File uploads stored on R2 |
| **Pages** | `pages` | `title`, `slug`, `template`, `sections` (blocks) | Main page content with flexible blocks |
| **Templates** | `templates` | `name`, `description`, `layoutConfig`, `isActive`, `version` | Pre-built page templates (one active at a time) |
| **BlogArticles** | `blog-articles` | `title`, `slug`, `excerpt`, `content`, `featuredImage`, `author`, `publishedAt` | Blog posts |
| **Activities** | `activities` | `title`, `slug`, `description`, `content`, `image`, `date`, `category` | Events/workshops/seminars |
| **Subscriptions** | `subscriptions` | `plan`, `price`, `period`, `features`, `userId` | Billing/subscription management |

> **Note:** All collections extend `PayloadDocument` with `id`, `createdAt`, `updatedAt`.

---

## Blocks (Reusable Content Units)

Blocks are the building pages via the `blocks` field type. There are **11 block types** located in `apps/backoffice/src/blocks/`:

| Block | Slug | Used In |
|---|---|---|
| `HeroBlock` | `hero` | Page hero section |
| `ServicesBlock` | `services` | Services grid |
| `AboutBlock` | `about` | About section |
| `WhyUsBlock` | `whyUs` | Why choose us |
| `TeamBlock` | `team` | Team members |
| `PortfolioBlock` | `portfolio` | Portfolio projects |
| `BlogBlock` | `blog` | Blog posts list |
| `PricingBlock` | `pricing` | Pricing plans |
| `CTABlock` | `cta` | Call-to-action |
| `ContactBlock` | `contact` | Contact form & info |

### Creating a New Block

1. **Define block shape** in `apps/backoffice/src/blocks/<Name>.ts`:
   - Extend `import type { Block } from 'payload'`
   - Export `const <Name>Block: Block = { slug: '<slug>', labels, fields }`
   - Use Payload field types: `text`, `textarea`, `image`, `array`, `blocks`, `json`, `relationship`, `upload`

2. **Export from barrel** `apps/backoffice/src/blocks/index.ts`:
   ```ts
   export { <Name>Block } from './<Name>'
   ```

3. **Register in a collection** (e.g., `Pages.ts`):
   ```ts
   import { <Name>Block } from '../blocks'
   sections: {
     type: 'blocks',
     blocks: [/* all block imports */],
   }
   ```

4. **Create frontend section** in `packages/ui/src/sections/<Name>Section.tsx`:
   - Define `SectionProps` matching the block fields
   - Render the HTML layout
   - Default values should match block defaults

5. **Update Payload types** if needed in `packages/shared/src/types.ts`

---

## Templates (Pre-built Page Layouts)

Templates provide pre-designed page layouts. Managed via the `templates` collection at `apps/backoffice/src/collections/Templates.ts`.

### Template Fields

| Field | Type | Description |
|---|---|---|
| `name` | `text` | Extracted from manifest.json (readOnly) |
| `description` | `textarea` | Extracted from manifest.json (readOnly) |
| `previewImage` | `upload` \| `media` | Preview image (readOnly) |
| `layoutConfig` | `json` | Auto-generated HTML structure (readOnly, required) |
| `zipFile` | `upload` \| `media` | Original ZIP (readOnly) |
| `isActive` | `checkbox` | Only one can be active at a time |
| `version` | `text` | Version string (readOnly) |
| `category` | `text` | Category tag (readOnly) |

### Template Lifecycle

- **Creating**: Upload a ZIP containing `manifest.json`, `preview.jpg`, and HTML structure
- **Activation**: Setting `isActive: true` deactivates all other templates (hook in `Templates.ts`)
- **Rebuild**: On template change, a Cloudflare webhook (`CLOUDFLARE_REBUILD_WEBHOOK`) triggers site regeneration
- **Only one active**: Hook ensures mutual exclusivity

### Creating a New Template

1. **Add template entry** via Payload admin or API with:
   - `name`, `description`, `previewImage`, `layoutConfig` (JSON), `zipFile`
   - Set `isActive: true` to make it the default

2. **LayoutConfig format** (example):
   ```json
   {
     "blocks": ["hero", "services", "cta"],
     "grid": "12",
     "spacing": "scale-4"
   }
   ```
   - Stored readOnly; generated from the ZIP's HTML structure during import

3. **Frontend integration**: The template's layout is rendered in `pages/[slug].tsx` or specific page routes, using the `template` field from the `pages` collection to determine which layout to load.

---

## Media Storage (R2)

- Configured in `payload.config.ts` using `@payloadcms/storage-s3` with R2 settings
- Bucket: `perissos-media` (configurable via `R2_BUCKET`)
- Public URL: `R2_PUBLIC_URL` + optional `R2_PREFIX`
- Upload configured for: `media` collection only
- File URLs generated as: `${R2_PUBLIC_URL}/${prefix}/${filename}`

### Adding Media to Other Collections

- Use `relationTo: 'media'` field type (e.g., `Templates.previewImage`, `BlogArticle.featuredImage`, `AboutBlock.mainImage`)
- Uploaded files appear in the Payload media library

---

## API & Authentication

- **Secret**: `PAYLOAD_SECRET` env var
- **CORS**: `http://localhost:3001`, `http://localhost:3000`
- **CSRF**: Same origins as CORS
- **Database**: PostgreSQL connection pool (max 20 connections)
- **Push**: Disabled (`push: false`) — migrations managed externally

### Access Control

| Collection | Read | Create | Update | Delete |
|---|---|---|---|---|
| `pages` | ✓ public | admin/editor | admin/editor | admin |
| `templates` | ✓ public | admin | admin | admin |
| `blog-articles` | ✓ public | admin | admin | admin |
| `activities` | ✓ public | admin | admin | admin |
| `users` | — | admin | admin | admin |
| `media` | — | — | — | — |
| `subscriptions` | — | — | — | — |

---

## Frontend Integration

### Section Mapping

Each block has a corresponding UI section in `packages/ui/src/sections/`:

| Block | Section | Props |
|---|---|---|
| `HeroBlock` | `HeroSection` | `badgeIcon`, `badgeText`, `title`, `titleHighlight`, `description`, `primaryButton*`, `secondaryButton*`, `stats?`, `floatingCards?` |
| `ServicesBlock` | `ServicesSection` | `badgeIcon`, `badgeText`, `title`, `titleHighlight`, `description`, `items?` |
| `AboutBlock` | `AboutSection` | (check file) |
| `WhyUsBlock` | `WhyUsSection` | (check file) |
| `TeamBlock` | `TeamSection` | (check file) |
| `PortfolioBlock` | `PortfolioSection` | (check file) |
| `BlogBlock` | `BlogSection` | (check file) |
| `PricingBlock` | `PricingSection` | `badgeIcon`, `badgeText`, `title`, `titleHighlight`, `description`, `plans?` |
| `CTABlock` | `CTASection` | `title`, `description`, `buttonText`, `buttonIcon`, `buttonUrl` |
| `ContactBlock` | `ContactSection` | (check file) |

### Rendering Pages

Pages are rendered using the `template` field assigned to each page:

```ts
// Example: pages/[slug].tsx
import { getPayload } from 'payload'

export async function generateStaticParams() {
  const payload = await getPayload()
  const pages = await payload.find({ collection: 'pages', pagination: false })
  return pages.docs.map(page => ({ slug: page.slug }))
}

export default async function Page({ params }) {
  const payload = await getPayload()
  const page = await payload.findByID({
    collection: 'pages',
    id: params.slug, // or find by slug
  })

  // Map template -> section components
  const template = page.template // references templates collection
  
  // Render based on template.blocks and page.sections
}
```

---

## Development Workflow

1. **Create block** → `apps/backoffice/src/blocks/<Name>.ts`
2. **Export block** → `apps/backoffice/src/blocks/index.ts`
3. **Register in collection** → `apps/backoffice/src/collections/Pages.ts` (or other)
4. **Create UI section** → `packages/ui/src/sections/<Name>Section.tsx`
5. **Update types** → `packages/shared/src/types.ts` if needed
6. **Run typecheck**: `pnpm typecheck`
7. **Test locally**: `pnpm dev` (backoffice at `:3000`, frontend at `:3001`)
8. **Deploy**: Docker + Cloudflare deployment triggers on webhook

---

## Key Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | CMS secret for JWT |
| `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | Object storage |
| `R2_PUBLIC_URL` | Public URL for media |
| `CLOUDFLARE_REBUILD_WEBHOOK` | Webhook to trigger site rebuild |
| `NEXT_PUBLIC_CMS_URL` | Public CMS URL |
| `LOGTAIL_SOURCE_TOKEN` | Logging |

---

## Adding a New Template + Page Type

1. **Create block** (if needed) — see "Creating a New Block" above
2. **Create UI section** — see section mapping above
3. **Add template entry** in Payload admin:
   - Fill `name`, `description`, `previewImage`, `layoutConfig`
   - Upload `zipFile`
   - Set `isActive: true`
4. **Create a page** in Payload:
   - Assign the new template to `template` field
   - Add `sections` (blocks) content
5. **Frontend**: The page will automatically use the template's layout config + populated block data via the UI sections.

---

## Guidelines for Agents

- **Never modify `payload.config.ts`** without updating the type output (`pnpm run build`)
- **Block fields** should be serializable (avoid functions, complex objects)
- **Default values** in blocks are reflected in the UI sections
- **R2 bucket names** and URLs are env‑specific — do not hardcode
- **Template activation** is exclusive — only one template can be `isActive: true` at a time
- **Use `packages/shared/src/utils`** for common functions (slugify, formatDate, cn, etc.)
- **Follow the existing block structure** — keep field names consistent with UI section props
- **Run `pnpm test:ci`** before committing to ensure typecheck + build pass