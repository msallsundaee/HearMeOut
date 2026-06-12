import type { CollectionConfig } from 'payload'
import { isSecureAPI } from '../access/isSecureAPI'

export const SwipeHistory: CollectionConfig = {
  slug: 'swipe-history',
  admin: {
    useAsTitle: 'action',
  },
  access: {
    read: isSecureAPI,
    create: isSecureAPI,
    update: isSecureAPI,
    delete: isSecureAPI,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'track',
      type: 'relationship',
      relationTo: 'tracks',
      required: true,
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Save', value: 'save' },
        { label: 'Skip', value: 'skip' }
      ],
      required: true,
    },
    {
      name: 'timestamp',
      type: 'date',
      defaultValue: () => new Date(),
    }
  ],
}
