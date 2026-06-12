import type { CollectionConfig } from 'payload'
import { isSecureAPI } from '../access/isSecureAPI'

export const Tracks: CollectionConfig = {
  slug: 'tracks',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: isSecureAPI,
    create: isSecureAPI,
    update: isSecureAPI,
    delete: isSecureAPI,
  },
  fields: [
    {
      name: 'spotifyId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'artist',
      type: 'text',
      required: true,
    },
    {
      name: 'albumArt',
      type: 'text',
    },
    {
      name: 'previewUrl',
      type: 'text',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    }
  ],
}
