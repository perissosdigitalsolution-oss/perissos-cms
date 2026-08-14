import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Contact', plural: 'Contact' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'contactItems',
      type: 'array',
      fields: [
        { name: 'icon', type: 'text', required: true, admin: { description: 'Font Awesome icon e.g. fas fa-map-marker-alt' } },
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'icon', type: 'text', required: true, admin: { description: 'Font Awesome icon e.g. fab fa-facebook-f' } },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'formFields',
      type: 'array',
      label: 'Contact Form Fields',
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'Field label (e.g. Your Name)' } },
        { name: 'name', type: 'text', required: true, admin: { description: 'Field name attribute (e.g. name)' } },
        { name: 'type', type: 'select', required: true, options: ['text', 'email', 'textarea', 'select', 'tel'], defaultValue: 'text' },
        { name: 'required', type: 'checkbox', defaultValue: true },
        { name: 'placeholder', type: 'text' },
        { name: 'options', type: 'array', admin: { condition: (_, siblingData) => siblingData.type === 'select' }, fields: [
          { name: 'value', type: 'text', required: true },
          { name: 'label', type: 'text', required: true },
        ]},
      ],
    },
    { name: 'submitButtonText', type: 'text', defaultValue: 'Send Message', admin: { description: 'Submit button text' } },
    { name: 'submitButtonIcon', type: 'text', defaultValue: 'fas fa-paper-plane', admin: { description: 'Submit button icon (Font Awesome)' } },
  ],
}
