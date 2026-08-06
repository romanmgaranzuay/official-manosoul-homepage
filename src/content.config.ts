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
    spotifyUrl: z.string().url().optional(),
    appleMusicUrl: z.string().url().optional(),
    youtubeUrl: z.string().url().optional(),
    youtubeMusicUrl: z.string().url().optional(),    // NEW
    amazonMusicUrl: z.string().url().optional(),     // NEW
    bandcampUrl: z.string().url().optional(),
    soundcloudUrl: z.string().url().optional(), 
    digitalDownloadUrl: z.string().url().optional(), // NEW
  }),
});

export const collections = {
  releases: releasesCollection,
};