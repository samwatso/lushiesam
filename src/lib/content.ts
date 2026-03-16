/**
 * Unified Content Access Layer
 *
 * Merges Astro content collections with Suds imports so every page
 * gets a single, consistent data source. Content collection entries
 * take priority when IDs collide.
 */

import { getCollection, render } from 'astro:content';
import { loadSudsImports } from './suds';
import type { SudsImportResult } from './suds';

// --- Unified types ---

export interface BoxEntry {
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
  source: 'collection' | 'suds';
  bodyHtml?: string;
  /** Original collection entry — only present for collection sources */
  _collectionEntry?: any;
}

export interface ProductEntry {
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
  source: 'collection' | 'suds';
}

// --- Cache (persists within a single build) ---

let _suds: SudsImportResult | null = null;
function getSuds(): SudsImportResult {
  if (!_suds) _suds = loadSudsImports();
  return _suds;
}

// --- Public API ---

export async function getAllBoxes(): Promise<BoxEntry[]> {
  const collectionBoxes = await getCollection('kitchenBoxes');
  const suds = getSuds();

  const collectionIds = new Set(collectionBoxes.map((b) => b.id));

  return [
    ...collectionBoxes.map((box) => ({
      id: box.id,
      data: box.data,
      source: 'collection' as const,
      _collectionEntry: box,
    })),
    ...suds.boxes
      .filter((b) => !collectionIds.has(b.id))
      .map((b) => ({
        id: b.id,
        data: b.data,
        source: 'suds' as const,
        bodyHtml: b.bodyHtml,
      })),
  ];
}

export async function getAllProducts(): Promise<ProductEntry[]> {
  const collectionProducts = await getCollection('products');
  const suds = getSuds();

  const collectionIds = new Set(collectionProducts.map((p) => p.id));

  return [
    ...collectionProducts.map((p) => ({
      id: p.id,
      data: p.data,
      source: 'collection' as const,
    })),
    ...suds.products
      .filter((p) => !collectionIds.has(p.id))
      .map((p) => ({
        id: p.id,
        data: p.data,
        source: 'suds' as const,
      })),
  ];
}

/**
 * Render a box's editorial body content.
 * Collection entries use Astro's render() → Content component.
 * Suds entries return pre-rendered HTML string.
 */
export async function renderBoxContent(
  box: BoxEntry,
): Promise<{ Content?: any; html?: string }> {
  if (box.source === 'collection' && box._collectionEntry) {
    const { Content } = await render(box._collectionEntry);
    return { Content };
  }
  return { html: box.bodyHtml ?? '' };
}
