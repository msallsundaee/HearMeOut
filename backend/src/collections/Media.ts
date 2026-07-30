import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Only ever used for category cards, rendered at ~288x192 (up to ~576x384
    // at 2x DPR). Without this, Payload served the original upload — a
    // Lighthouse audit on the categories page measured 621 KiB wasted across
    // the grid from oversized, non-webp images.
    imageSizes: [
      {
        name: 'card',
        width: 600,
        height: 800,
        position: 'centre',
      },
    ],
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
  },
}
