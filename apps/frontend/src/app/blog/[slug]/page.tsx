import { notFound } from 'next/navigation';
import { getBlogArticles, getBlogArticleBySlug } from '@/lib/api';
import { RichTextRenderer, type RichTextNode } from '@/components/RichTextRenderer';

export const dynamicParams = false;

export async function generateStaticParams() {
  const { docs: articles } = await getBlogArticles();
  const slugs = articles.map((article) => article.slug);
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: 'placeholder' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { docs } = await getBlogArticleBySlug(slug);
  if (!docs.length) return {};

  const article = docs[0];
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featuredImage ? [article.featuredImage.url] : [],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { docs } = await getBlogArticleBySlug(slug);

  if (!docs.length) {
    notFound();
  }

  const article = docs[0];

  return (
    <main className="container mx-auto px-4 py-16">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span>{article.author?.name}</span>
          <span>•</span>
          <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
        </div>
        {article.featuredImage && (
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            className="w-full h-auto rounded-xl mb-8"
          />
        )}
        <div className="prose prose-lg dark:prose-invert">
          <RichTextRenderer content={article.content as RichTextNode | RichTextNode[]} />
        </div>
      </article>
    </main>
  );
}
