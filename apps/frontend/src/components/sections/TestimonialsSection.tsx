'use client';

import React from 'react';
import { Card } from '@perissos/ui';

interface TestimonialsSectionProps {
  html?: string;  // NEW: Custom HTML template
}

export function TestimonialsSection({ html }: TestimonialsSectionProps) {
  // If custom HTML is provided, render it directly
  if (html) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    );
  }

  // Default data-driven rendering
  const testimonials = [
    {
      quote: 'Perissos CMS transformed how we deliver websites to clients. The live preview feature alone saves us hours every week.',
      author: 'Sarah Chen',
      role: 'Creative Director',
      company: 'Studio Apex',
    },
    {
      quote: 'The provisioning automation is a game-changer. We onboarded 15 new clients last month with zero manual intervention.',
      author: 'Marcus Johnson',
      role: 'CTO',
      company: 'Digital Forge',
    },
    {
      quote: 'Finally a CMS that feels premium. The design system, the animations, the attention to detail - it shows.',
      author: 'Emma Rodriguez',
      role: 'Founder',
      company: 'Lumina Digital',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Leading Agencies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See what teams are saying about Perissos CMS.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} variant="glass" hover padding="lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}