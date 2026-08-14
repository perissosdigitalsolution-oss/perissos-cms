import type { CollectionConfig } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'plan',
    defaultColumns: ['plan', 'status', 'stripeCustomerId', 'trialEndsAt', 'updatedAt'],
  },
  fields: [
    {
      name: 'plan',
      type: 'select',
      required: true,
      options: [
        { label: 'Free (14-day trial)', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      defaultValue: 'free',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Trial', value: 'trial' },
        { label: 'Active', value: 'active' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Expired', value: 'expired' },
      ],
      defaultValue: 'trial',
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'stripePriceId',
      type: 'text',
    },
    {
      name: 'trialEndsAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => false,
  },
}
