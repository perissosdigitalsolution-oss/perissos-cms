import type { Block } from 'payload'

export const TeamBlock: Block = {
  slug: 'team',
  labels: { singular: 'Team', plural: 'Team' },
  fields: [
    { name: 'badgeIcon', type: 'text' },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'members',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true },
        { name: 'avatarIcon', type: 'text', defaultValue: 'fas fa-user', admin: { description: 'Font Awesome icon for placeholder avatar' } },
        { name: 'avatarImage', type: 'text', admin: { description: 'Avatar image URL (optional, replaces icon)' } },
        { name: 'profileImage', type: 'text', admin: { description: 'Optional profile image URL (overrides avatar icon)' } },
        {
          name: 'social',
          type: 'array',
          maxRows: 5,
          fields: [
            { name: 'icon', type: 'text', required: true, admin: { description: 'Font Awesome icon e.g. fab fa-linkedin-in' } },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
