import React from 'react';
import { Metadata } from 'next';
import PostClient from './PostClient';
import { axiosInstance } from '../../../lib/axios';

interface PostData {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tags: string[];
  author: { id: string; username: string; role: string; isVerifiedExpert?: boolean };
}

const MOCK_POST: PostData = {
  id: '1',
  title: 'Kỹ thuật trồng Dưa lưới trong nhà màng đạt năng suất cao',
  content: `
    <p>Dưa lưới (Cucumis melo) là loại cây trồng có giá trị kinh tế cao. Tuy nhiên, để đạt năng suất và chất lượng trái tốt nhất, quy trình kỹ thuật trồng dưa lưới trong nhà màng đòi hỏi sự chuẩn xác cao.</p>
    <br/>
    <h3 className="font-bold text-lg">1. Chuẩn bị nhà màng và giá thể</h3>
    <p>Nhà màng cần đảm bảo độ thông thoáng, có hệ thống quạt gió và lưới chắn côn trùng. Giá thể trồng thường là xơ dừa đã qua xử lý tanin kết hợp với phân hữu cơ vi sinh.</p>
    <br/>
    <h3 className="font-bold text-lg">2. Kỹ thuật bón phân và tưới nước</h3>
    <p>Áp dụng hệ thống tưới nhỏ giọt tự động để cung cấp dinh dưỡng trực tiếp đến từng gốc cây theo nhu cầu từng giai đoạn phát triển.</p>
  `,
  viewCount: 1250,
  likeCount: 45,
  commentCount: 12,
  createdAt: new Date().toISOString(),
  tags: ['Trồng trọt', 'Dưa lưới'],
  author: { id: 'a1', username: 'expert_viet', role: 'EXPERT', isVerifiedExpert: true }
};

async function getPostData(slug: string): Promise<PostData> {
  try {
    const res = await axiosInstance.get(`/posts/${slug}`);
    if (res.data) return res.data;
    return MOCK_POST;
  } catch (error) {
    return MOCK_POST;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostData(params.slug);

  return {
    title: `${post.title} | Thư viện Nông nghiệp`,
    description: post.content.replace(/<[^>]*>/g, '').substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.replace(/<[^>]*>/g, '').substring(0, 160),
      images: ['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=80'],
    },
  };
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=80',
    datePublished: post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author.username,
    },
  };

  return (
    <div className="py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostClient post={post} />
    </div>
  );
}
