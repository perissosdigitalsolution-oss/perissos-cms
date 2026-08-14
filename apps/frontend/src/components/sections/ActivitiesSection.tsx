'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from '@/lib/api';
import { cn } from '@perissos/shared';

interface ActivitiesSectionProps {
  activities: Activity[];
}

const categoryColors: Record<string, string> = {
  workshop: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  seminar: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  conference: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  retreat: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export function ActivitiesSection({ activities }: ActivitiesSectionProps) {
  if (!activities.length) return null;

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Upcoming Activities
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our workshops, seminars, and events.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <Link
              key={activity.slug}
              href={`/activity/${activity.slug}`}
              className="group block"
            >
              <article className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-purple-500/50 transition-all duration-300">
                {activity.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={activity.image.url}
                      alt={activity.image.alt || activity.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        categoryColors[activity.category] || categoryColors.other
                      )}>
                        {activity.category}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <time className="text-sm text-gray-500 mb-2 block">
                    {new Date(activity.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {activity.title}
                  </h3>
                  {activity.description && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {activity.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold text-purple-600 dark:text-purple-400 border-2 border-purple-500 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
          >
            View All Activities
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
