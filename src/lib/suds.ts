/**
 * Suds Import Layer
 *
 * Reads export bundles from src/data/imports/ and transforms them into
 * the same data shapes used by Astro content collections.
 *
 * Bundle structure:
 *   src/data/imports/{slug}/
 *     box.json          — box metadata + inline products
 *     products.json     — standalone product entries (optional)
 *     relationships.json — cross-bundle product-to-box links (optional)
 *     graph.json        — pre-computed graph data (optional, reserved)
 *
 * Image paths: relative paths in JSON are prefixed with /images/boxes/{slug}/.
 * Absolute paths (starting with / or http) are used as-is.
 */

import fs from 'node:fs';
import path from 'node:path';

const IMPORTS_DIR = path.join(process.cwd(), 'src', 'data', 'imports');

// --- Suds bundle JSON shapes ---

interface SudsBoxJson {
  title: string;
  month: string;
  year: number;
  issue?: number;
  summary: string;
  heroImage?: string;
  groupShot?: string;
  tiktokUrl?: string;
  tiktokEmbedId?: string;
  youtubeId?: string;
  kitchenMenuUrl?: string;
  products?: {
    name: string;
    type?: string;
    description?: string;
    image?: string;
    scent?: string;
    highlight?: boolean;
    nostalgiaNote?: string;
  }[];
  screenshots?: { src: string; alt?: string; caption?: string }[];
  caption?: string;
  hashtags?: string[];
  nostalgiaNotes?: { title?: string; body: string }[];
  relatedProducts?: string[];
  publishedDate?: string;
  draft?: boolean;
  body?: string;
  bodyHtml?: string;
}

interface SudsProductJson {
  name: string;
  type: string;
  description?: string;
  image?: string;
  scent?: string;
  ingredients?: string[];
  discontinued?: boolean;
  kitchenExclusive?: boolean;
  tags?: string[];
  body?: string;
  bodyHtml?: string;
}

interface SudsRelationshipsJson {
  productToBoxes?: Record<string, string[]>;
}

// --- Output shapes (matching content collection entries) ---

export interface SudsBoxEntry {
  id: string;
  data: {
    title: string;
    month: string;
    year: number;
    summary: string;
    heroImage?: string;
    groupShot?: string;
    tiktokUrl?: string;
    tiktokEmbedId?: string;
    products?: {
      name: string;
      type?: string;
      description?: string;
      image?: string;
      scent?: string;
      highlight?: boolean;
      nostalgiaNote?: string;
    }[];
    screenshots?: { src: string; alt?: string; caption?: string }[];
    caption?: string;
    hashtags?: string[];
    nostalgiaNotes?: { title?: string; body: string }[];
    relatedProducts?: string[];
    publishedDate?: Date;
    draft: boolean;
  };
  bodyHtml?: string;
  source: 'suds';
}

export interface SudsProductEntry {
  id: string;
  data: {
    name: string;
    type: string;
    description?: string;
    image?: string;
    scent?: string;
    ingredients?: string[];
    discontinued: boolean;
    kitchenExclusive: boolean;
    tags?: string[];
    relatedBoxes?: string[];
    draft: boolean;
  };
  source: 'suds';
}

// --- Helpers ---

function resolveImagePath(imagePath: string | undefined, slug: string): string | undefined {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('/') || imagePath.startsWith('http')) return imagePath;
  return `/images/boxes/${slug}/${imagePath}`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

// --- Main loader ---

export interface SudsImportResult {
  boxes: SudsBoxEntry[];
  products: SudsProductEntry[];
}

export function loadSudsImports(): SudsImportResult {
  const boxes: SudsBoxEntry[] = [];
  const products: SudsProductEntry[] = [];
  const productIdSet = new Set<string>();

  if (!fs.existsSync(IMPORTS_DIR)) return { boxes, products };

  const dirs = fs.readdirSync(IMPORTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    const bundlePath = path.join(IMPORTS_DIR, dir);
    const slug = dir;

    // --- box.json ---
    const boxJson = readJson<SudsBoxJson>(path.join(bundlePath, 'box.json'));
    if (boxJson) {
      boxes.push({
        id: slug,
        data: {
          title: boxJson.title,
          month: boxJson.month,
          year: boxJson.year,
          summary: boxJson.summary,
          heroImage: resolveImagePath(boxJson.heroImage, slug),
          groupShot: resolveImagePath(boxJson.groupShot, slug),
          tiktokUrl: boxJson.tiktokUrl,
          tiktokEmbedId: boxJson.tiktokEmbedId,
          youtubeId: boxJson.youtubeId,
          kitchenMenuUrl: boxJson.kitchenMenuUrl,
          products: boxJson.products?.map((p) => ({
            name: p.name,
            type: p.type,
            description: p.description,
            image: resolveImagePath(p.image, slug),
            scent: p.scent,
            highlight: p.highlight,
            nostalgiaNote: p.nostalgiaNote,
          })),
          screenshots: boxJson.screenshots?.map((s) => ({
            src: resolveImagePath(s.src, slug)!,
            alt: s.alt,
            caption: s.caption,
          })),
          caption: boxJson.caption,
          hashtags: boxJson.hashtags,
          nostalgiaNotes: boxJson.nostalgiaNotes,
          relatedProducts: boxJson.relatedProducts,
          publishedDate: boxJson.publishedDate ? new Date(boxJson.publishedDate) : undefined,
          draft: boxJson.draft ?? false,
        },
        bodyHtml: boxJson.bodyHtml || boxJson.body,
        source: 'suds',
      });
    }

    // --- products.json ---
    const productsJson = readJson<SudsProductJson[]>(path.join(bundlePath, 'products.json'));
    if (productsJson) {
      for (const p of productsJson) {
        const pid = slugify(p.name);
        if (productIdSet.has(pid)) continue;
        productIdSet.add(pid);

        products.push({
          id: pid,
          data: {
            name: p.name,
            type: p.type,
            description: p.description,
            image: resolveImagePath(p.image, slug),
            scent: p.scent,
            ingredients: p.ingredients,
            discontinued: p.discontinued ?? false,
            kitchenExclusive: p.kitchenExclusive ?? false,
            tags: p.tags,
            relatedBoxes: [slug],
            draft: false,
          },
          source: 'suds',
        });
      }
    }

    // --- relationships.json (augment relatedBoxes) ---
    const rels = readJson<SudsRelationshipsJson>(path.join(bundlePath, 'relationships.json'));
    if (rels?.productToBoxes) {
      for (const [productName, boxSlugs] of Object.entries(rels.productToBoxes)) {
        const pid = slugify(productName);
        const existing = products.find((p) => p.id === pid);
        if (existing) {
          const current = existing.data.relatedBoxes ?? [];
          existing.data.relatedBoxes = [...new Set([...current, ...boxSlugs])];
        }
      }
    }
  }

  return { boxes, products };
}
