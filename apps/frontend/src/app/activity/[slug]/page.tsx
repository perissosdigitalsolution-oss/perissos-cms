import { notFound } from 'next/navigation';
import { getActivities, getActivityBySlug } from '@/lib/api';
import { RichTextRenderer, type RichTextNode } from '@/components/RichTextRenderer';

export const dynamicParams = false;

export async function generateStaticParams() {
  const { docs: activities } = await getActivities();
  const slugs = activities.map((activity) => activity.slug);
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: 'placeholder' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { docs } = await getActivityBySlug(slug);
  if (!docs.length) return {};

  const activity = docs[0];
  return {
    title: activity.title,
    description: activity.description,
    openGraph: {
      title: activity.title,
      description: activity.description,
      images: activity.image ? [activity.image.url] : [],
    },
  };
}

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { docs } = await getActivityBySlug(slug);

  if (!docs.length) {
    notFound();
  }

  const activity = docs[0];

  return (
    <main className="container mx-auto px-4 py-16">
      <article className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">
            {activity.category}
          </span>
          <span>•</span>
          <time>{new Date(activity.date).toLocaleDateString()}</time>
        </div>
        <h1 className="text-4xl font-bold mb-4">{activity.title}</h1>
        {activity.image && (
          <img
            src={activity.image.url}
            alt={activity.image.alt || activity.title}
            className="w-full h-auto rounded-xl mb-8"
          />
        )}
        {activity.description && (
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {activity.description}
          </p>
        )}
        {!!activity.content && (
          <div className="prose prose-lg dark:prose-invert">
            <RichTextRenderer content={activity.content as RichTextNode | RichTextNode[]} />
          </div>
        )}
      </article>
    </main>
  );
}
