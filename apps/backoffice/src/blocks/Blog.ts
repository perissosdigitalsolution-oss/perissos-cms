import type { Block } from 'payload'

export const BlogBlock: Block = {
  slug: 'blog',
  labels: { singular: 'Blog', plural: 'Blog' },
  fields: [
    { name: 'badgeIcon', type: 'text' },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'posts',
      type: 'array',
      minRows: 1,
      maxRows: 9,
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon' } },
        { name: 'imageIcon', type: 'text', admin: { description: 'Icon shown in blog image placeholder' } },
        { name: 'date', type: 'text', required: true, admin: { description: 'e.g. Jan 15, 2025' } },
        { name: 'tag', type: 'text', required: true, admin: { description: 'e.g. AI Technology' } },
        { name: 'title', type: 'text', required: true },
        { name: 'author', type: 'text', defaultValue: 'Admin' },
        { name: 'readTime', type: 'text', defaultValue: '5 Min Read' },
        { name: 'linkUrl', type: 'text', defaultValue: '#' },
      ],
    },
  ],
}
