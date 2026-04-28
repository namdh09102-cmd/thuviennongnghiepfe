'use client';

import React, { useEffect } from 'react';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  const sanitizedContent = typeof window !== 'undefined' 
    ? DOMPurify.sanitize(content) 
    : content;

  return (
    <div 
      className="prose prose-green max-w-none 
        prose-headings:font-black prose-headings:text-gray-900
        prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:text-base
        prose-img:rounded-3xl prose-img:shadow-lg prose-img:mx-auto
        prose-code:text-green-600 prose-code:bg-green-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-xl
        prose-table:border prose-table:border-gray-100 prose-table:rounded-xl prose-table:overflow-hidden
        prose-th:bg-gray-50 prose-th:p-4 prose-td:p-4"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
