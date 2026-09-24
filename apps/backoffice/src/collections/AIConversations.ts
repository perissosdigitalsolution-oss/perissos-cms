import { CollectionConfig } from 'payload'

export const AIConversations: CollectionConfig = {
  slug: 'ai-conversations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'updatedAt'],
    group: 'AI Assistant',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin' || user.id === user.id // Users can read their own
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user }, data }) => {
      if (!user) return false
      // Users can only update their own conversations
      return user.role === 'admin' || user.id === data?.user
    },
    delete: ({ req: { user }, data }) => {
      if (!user) return false
      return user.role === 'admin' || user.id === data?.user
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'messages',
      type: 'json',
      defaultValue: [],
    },
    {
      name: 'context',
      type: 'json',
      defaultValue: {},
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}