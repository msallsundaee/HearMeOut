import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'spotifyPlaylistId',
      type: 'text',
      admin: {
        description:
          'Strongly recommended: pulls tracks straight from this curated Spotify playlist instead of a genre search, guaranteeing they actually belong to this category. Accepts a playlist ID, a spotify:playlist:... URI, or a full open.spotify.com/playlist/... link — must be a public, non-Spotify-owned playlist (editorial playlists like Today\'s Top Hits aren\'t reachable this way). Optional — falls back to a best-effort genre-keyword search when left blank, which Spotify no longer lets us verify (genre metadata was locked down for standard API access in late 2024), so unrelated tracks can slip through.',
      }
    }
  ],
}
