import type { Block } from 'payload'

export const ReservationBlock: Block = {
  slug: 'reservation',
  labels: { singular: 'Reservation', plural: 'Reservations' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-calendar-check' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'benefits',
      type: 'array',
      label: 'Benefits List',
      fields: [
        { name: 'icon', type: 'text', defaultValue: 'fas fa-check-circle' },
        { name: 'text', type: 'text', required: true },
      ],
    },
    { name: 'submitButtonText', type: 'text', defaultValue: 'Confirm Reservation' },
    { name: 'submitButtonIcon', type: 'text', defaultValue: 'fas fa-check' },
  ],
}
