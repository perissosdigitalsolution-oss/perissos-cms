'use client';

import React from 'react';
import { Card } from '@perissos/ui';

interface FeaturesSectionProps {
  html?: string;  // NEW: Custom HTML template
}

export function FeaturesSection({ html }: FeaturesSectionProps) {
  const features = [
    {
      title: 'Lightning Fast',
      description: 'Static export on Cloudflare CDN delivers sub-500ms page loads globally.',
      icon: '⚡',
    },
    {
      title: 'Real-time Preview',
      description: 'See your changes instantly with secure JWT-powered live preview.',
      icon: '👁️',
    },
    {
      title: 'Flexible Content',
      description: 'Rich text, media, custom fields - all managed through an intuitive admin.',
      icon: '📝',
    },
    {
      title: 'Multi-tenant Isolation',
      description: 'Each client gets their own database, media bucket, and deployment.',
      icon: '🔒',
    },
    {
      title: 'Premium Design System',
      description: 'Beautiful components with glass morphism, animations, and dark mode.',
      icon: '🎨',
    },
    {
      title: 'Automated Provisioning',
      description: 'New client instances in under 5 minutes with zero manual steps.',
      icon: '🚀',
    },
  ];

  // If custom HTML is provided, render it directly
  if (html) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    );
  }

  // Default data-driven rendering
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Modern Teams
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to build, manage, and scale premium websites.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} variant="glass" hover padding="lg">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}