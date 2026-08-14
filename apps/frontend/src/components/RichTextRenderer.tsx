'use client';

import React from 'react';

export interface RichTextNode {
  type: string;
  level?: number;
  listType?: 'numbered' | 'bulleted';
  children?: RichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export function RichTextRenderer({ content }: { content: RichTextNode | RichTextNode[] }) {
  if (!content) return null;

  const nodes = Array.isArray(content) ? content : [content];

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {nodes.map((node, index) => renderNode(node, index))}
    </div>
  );
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  if (!node) return null;

  if (node.type === 'paragraph') {
    return (
      <p key={index} className="mb-4">
        {node.children?.map((child, i) => renderInline(child, i))}
      </p>
    );
  }

  if (node.type === 'heading') {
    const level = node.children?.[0]?.level || 2;
    const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
    return (
      <Tag key={index} className="mb-4 font-bold">
        {node.children?.map((child, i) => renderInline(child, i))}
      </Tag>
    );
  }

  if (node.type === 'blockQuote') {
    return (
      <blockquote key={index} className="border-l-4 border-purple-500 pl-4 italic my-4">
        {node.children?.map((child, i) => renderInline(child, i))}
      </blockquote>
    );
  }

  if (node.type === 'list') {
    const Tag = node.listType === 'numbered' ? 'ol' : 'ul';
    return (
      <Tag key={index} className="list-inside space-y-2 mb-4" style={{ listStyleType: node.listType === 'numbered' ? 'decimal' : 'disc' }}>
        {node.children?.map((item, i) => (
          <li key={i}>{renderNode(item, i)}</li>
        ))}
      </Tag>
    );
  }

  if (node.type === 'listItem') {
    return (
      <li key={index} className="ml-4">
        {node.children?.map((child, i) => renderInline(child, i))}
      </li>
    );
  }

  if (node.type === 'upload' || node.type === 'image') {
    return (
      <figure key={index} className="my-6">
        {node.src && (
          <img
            src={node.src}
            alt={node.alt || ''}
            className="w-full h-auto rounded-xl"
          />
        )}
        {node.caption && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {node.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (node.type === 'link') {
    return (
      <a
        key={index}
        href={node.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 dark:text-purple-400 underline hover:no-underline"
      >
        {node.children?.map((child, i) => renderInline(child, i))}
      </a>
    );
  }

  if (typeof node === 'string') {
    return <span key={index}>{node}</span>;
  }

  if (node.children) {
    return (
      <span key={index}>
        {node.children.map((child, i) => renderInline(child, i))}
      </span>
    );
  }

  return null;
}

function renderInline(node: RichTextNode, index: number): React.ReactNode {
  if (typeof node === 'string') {
    return <span key={index}>{node}</span>;
  }

  if (!node) return null;

  if (node.type === 'text') {
    let text = node.text || '';
    let element: React.ReactElement = <span key={index}>{text}</span>;

    if (node.bold) element = <strong key={index}>{element}</strong>;
    if (node.italic) element = <em key={index}>{element}</em>;
    if (node.underline) element = <u key={index}>{element}</u>;
    if (node.strikethrough) element = <del key={index}>{element}</del>;
    if (node.code) element = <code key={index} className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{element}</code>;

    return element;
  }

  if (node.type === 'link') {
    return (
      <a
        key={index}
        href={node.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 dark:text-purple-400 underline hover:no-underline"
      >
        {node.children?.map((child, i) => renderInline(child, i))}
      </a>
    );
  }

  return node.children?.map((child, i) => renderInline(child, i));
}
