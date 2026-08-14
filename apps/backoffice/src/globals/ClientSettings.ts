import type { GlobalConfig } from 'payload'

export const ClientSettings: GlobalConfig = {
  slug: 'client-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'clientName',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'primaryColor',
      type: 'text',
      admin: {
        description: 'Hex color (e.g., #2A367A)',
      },
    },
    {
      name: 'secondaryColor',
      type: 'text',
      admin: {
        description: 'Hex color (e.g., #05C18E)',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
  ],
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
}
