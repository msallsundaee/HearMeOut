import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'spotifyId',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
    }
  ],
}
