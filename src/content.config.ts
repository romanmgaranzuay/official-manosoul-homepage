// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const releasesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/releases' }),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    slug: z.string().optional(),
    coverArt: z.string(),
    isPreSave: z.boolean().default(false),
    presaveUrl: z.string().url().optional(),
    spotifyUrl: z.string().url().optional(),
    appleMusicUrl: z.string().url().optional(),
    youtubeUrl: z.string().url().optional(),
    youtubeMusicUrl: z.string().url().optional(),
    amazonMusicUrl: z.string().url().optional(),
    bandcampUrl: z.string().url().optional(),
    soundcloudUrl: z.string().url().optional(),
    digitalDownloadUrl: z.string().url().optional(),
  }),
});

// The shop collection powers the merch grid and the Stripe checkout flow.
const shopCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/shop' }),
  schema: z.object({
    order: z.number().optional(),
    title: z.string(),
    type: z.enum(['digital', 'physical']),
    price: z.string(), // Display string shown in the UI, e.g. "$1.99"
    priceInCents: z.number(), // Amount in cents for Stripe API, e.g., 199
    coverImage: z.string(),
    description: z.string().optional(),
    inStock: z.boolean().default(true),
    stripePriceId: z.string(), // Stripe Price ID used to create the checkout line item.
    r2ObjectKey: z.string().optional(), // R2 object key used later to generate the download link.
  }),
});

export const collections = {
  releases: releasesCollection,
  shop: shopCollection,
};