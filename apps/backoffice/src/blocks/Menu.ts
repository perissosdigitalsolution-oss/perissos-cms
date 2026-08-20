import type { Block } from 'payload'

export const MenuBlock: Block = {
  slug: 'menu',
  labels: { singular: 'Menu', plural: 'Menus' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-utensils' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'categories',
      type: 'array',
      label: 'Menu Categories',
      minRows: 1,
      fields: [
        { name: 'name', type: 'text', required: true, admin: { description: 'Category name e.g. Appetizers' } },
        {
          name: 'items',
          type: 'array',
          label: 'Menu Items',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'text' },
            { name: 'price', type: 'text', required: true, admin: { description: 'e.g. $12' } },
            { name: 'image', type: 'text', admin: { description: 'Image URL (optional)' } },
            {
              name: 'dietaryTags',
              type: 'array',
              label: 'Dietary Tags',
              fields: [
                { name: 'tag', type: 'text', admin: { description: 'e.g. Vegetarian, Gluten-Free' } },
              ],
            },
            { name: 'isRecommended', type: 'checkbox', defaultValue: false, admin: { description: 'Show thumbs-up icon' } },
          ],
        },
      ],
    },
    { name: 'buttonText', type: 'text', defaultValue: 'View Full Menu' },
    { name: 'buttonIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
    { name: 'buttonUrl', type: 'text', defaultValue: '#menu' },
  ],
}
