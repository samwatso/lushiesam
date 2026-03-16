import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const kitchenBoxes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/kitchenBoxes' }),
  schema: z.object({
    title: z.string(),
    month: z.string(),
    year: z.number(),
    summary: z.string(),
    heroImage: z.string().optional(),
    groupShot: z.string().optional(),
    tiktokUrl: z.string().url().optional(),
    tiktokEmbedId: z.string().optional(),
    youtubeId: z.string().optional(),
    kitchenMenuUrl: z.string().url().optional(),
    products: z.array(z.object({
      name: z.string(),
      type: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      scent: z.string().optional(),
      highlight: z.boolean().optional(),
      nostalgiaNote: z.string().optional(),
    })).optional(),
    screenshots: z.array(z.object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })).optional(),
    caption: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    nostalgiaNotes: z.array(z.object({
      title: z.string().optional(),
      body: z.string(),
    })).optional(),
    relatedProducts: z.array(z.string()).optional(),
    publishedDate: z.coerce.date().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    scent: z.string().optional(),
    ingredients: z.array(z.string()).optional(),
    discontinued: z.boolean().optional().default(false),
    kitchenExclusive: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional(),
    relatedBoxes: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { kitchenBoxes, products };
