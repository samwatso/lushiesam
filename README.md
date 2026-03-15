# Lushie Sam

A Lush fan archive and creator site. Kitchen box reviews, product lore, and bath time content.

> Fan archive and creator site. Not affiliated with Lush Cosmetics.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) (static-first)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Content:** Markdown content collections
- **Styling:** Scoped CSS with custom properties (dark editorial theme)

## Getting Started

### Prerequisites

- Node.js 20+ (tested with Node 25)
- npm

### Install

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Opens at `http://localhost:4321`

### Build

```bash
npm run build
```

Output goes to `./dist/`

### Preview Build

```bash
npm run preview
```

## Deploying to Cloudflare Pages

### Via GitHub Integration (Recommended)

1. Push this repo to GitHub
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
3. Create a new project and connect your GitHub repo
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `20` (set via environment variable `NODE_VERSION=20`)
5. Deploy

### Via Wrangler CLI

```bash
npx wrangler pages deploy dist
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Hero.astro
│   ├── SectionHeading.astro
│   ├── BoxCard.astro
│   ├── ProductList.astro
│   ├── ScreenshotGallery.astro
│   ├── TikTokEmbed.astro
│   ├── NostalgiaNote.astro
│   └── CTABlock.astro
├── content/
│   ├── kitchenBoxes/    # Kitchen box markdown files
│   └── products/        # Product markdown files
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro          # Homepage
│   ├── about.astro          # About page
│   ├── what-is-kitchen.astro # What is Lush Kitchen? explainer
│   ├── my-lush-story.astro  # Sam's Lush origin story
│   ├── 404.astro            # 404 page
│   ├── kitchen-boxes/
│   │   ├── index.astro      # Archive listing
│   │   └── [slug].astro     # Individual box pages
│   └── products/
│       └── index.astro      # Product catalogue
├── styles/
│   └── global.css           # Design tokens & base styles
└── content.config.ts        # Content collection schemas
public/
└── images/
    ├── boxes/               # Kitchen box hero/group images
    ├── products/            # Product images
    └── screenshots/         # TikTok screenshots
```

## Adding Content

### New Kitchen Box

Create a markdown file in `src/content/kitchenBoxes/`:

```markdown
---
title: "April 2026 Kitchen Box"
month: "April"
year: 2026
summary: "Short description of the box"
heroImage: "/images/boxes/april-2026-hero.jpg"
groupShot: "/images/boxes/april-2026-group.jpg"
tiktokUrl: "https://www.tiktok.com/@lushiesam/video/..."
tiktokEmbedId: "7123456789"
products:
  - name: "Product Name"
    type: "Bath Bomb"
    description: "Description"
    image: "/images/products/product-name.jpg"
    scent: "Scent notes"
    highlight: true
    nostalgiaNote: "Optional nostalgia note"
screenshots:
  - src: "/images/screenshots/april-2026-01.jpg"
    alt: "Description"
    caption: "Caption text"
caption: "The TikTok caption used"
hashtags:
  - LushKitchen
  - LushieSam
nostalgiaNotes:
  - title: "Note Title"
    body: "Note body text"
relatedProducts: []
publishedDate: 2026-04-10
draft: false
---

Your review content in markdown here.
```

### New Product

Create a markdown file in `src/content/products/`:

```markdown
---
name: "Product Name"
type: "Bath Bomb"
description: "Short description"
image: "/images/products/product-name.jpg"
scent: "Scent notes"
ingredients:
  - Ingredient 1
  - Ingredient 2
discontinued: false
kitchenExclusive: true
tags:
  - floral
  - nostalgia
relatedBoxes:
  - march-2026
draft: false
---

Optional longer description in markdown.
```

### Images

Place images in the corresponding `public/images/` subdirectories:
- Box hero/group shots: `public/images/boxes/`
- Product photos: `public/images/products/`
- Screenshots: `public/images/screenshots/`

## Future: Suds Tool Integration

The content schema is designed to accept exports from the local "suds" tool. The expected export shape maps directly to the Kitchen Box frontmatter:

| Suds field       | Frontmatter field |
|------------------|-------------------|
| slug             | filename (e.g., `march-2026.md`) |
| month / year     | `month` / `year` |
| title            | `title` |
| summary          | `summary` |
| TikTok URL       | `tiktokUrl` |
| product list     | `products` array |
| screenshots      | `screenshots` array |
| group shot       | `groupShot` |
| nostalgia notes  | `nostalgiaNotes` array |
| caption used     | `caption` |
| hashtags         | `hashtags` array |
| related products | `relatedProducts` array |
| asset paths      | Image paths in `public/images/` |

A future sync script could write markdown files and copy images into this repo, then trigger a build via GitHub push.
