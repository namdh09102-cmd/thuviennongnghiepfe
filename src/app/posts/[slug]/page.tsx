import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ArrowLeft,
  Share2,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PostContent from '@/components/PostContent';
import CommentSection from '@/components/CommentSection';
import PostActions from '@/components/PostActions';
import PostCard from '@/components/PostCard';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getPost(slug: string) {
  const res = await fetch(`${API_URL}/api/posts/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getRelatedPosts(categoryId: number, currentSlug: string) {
  const res = await fetch(`${API_URL}/api/posts?category=${categoryId}&limit=4`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data.filter((p: any) => p.slug !== currentSlug);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };

  return {
    title: `${post.title} | Thư viện Nông nghiệp`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.thumbnail_url],
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author.full_name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.thumbnail_url],
    },
  };
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.category.id, post.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnail_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author.full_name,
      url: `${API_URL}/profile/${post.author.username}`,
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-green-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/posts?category=${post.category.slug}`} className="hover:text-green-600 transition-colors">
          {post.category.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 truncate max-w-[200px]">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <article className="lg:col-span-8">
          <header className="space-y-6 mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={post.author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Author'}
                    alt={post.author.full_name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  />
                  {post.author.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-none mb-1">{post.author.full_name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{post.author.role || 'Chuyên gia'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-xs font-bold text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>{format(new Date(post.published_at), 'dd/MM/yyyy', { locale: vi })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>8 phút đọc</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl shadow-green-900/10 group">
              <img
                src={post.thumbnail_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </header>

          {/* Content rendering component */}
          <PostContent content={post.content} />

          {/* Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gray-50">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}`}
                  className="px-4 py-2 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-xl text-xs font-black transition-all border border-transparent hover:border-green-100"
                >
                  # {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <PostActions post={post} />

          {/* Comment Section */}
          <CommentSection postSlug={post.slug} />
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Author Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm text-center">
            <img
              src={post.author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Author'}
              alt={post.author.full_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-green-50 shadow-md"
            />
            <h4 className="font-black text-lg text-gray-900 mb-1">{post.author.full_name}</h4>
            <p className="text-xs text-gray-500 font-medium mb-4">{post.author.bio || 'Chuyên gia tư vấn kỹ thuật nông nghiệp tại Thư viện Nông nghiệp.'}</p>
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
              <div>
                <p className="text-xl font-black text-green-600">{post.author.points || 0}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase">Điểm uy tín</p>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">12</p>
                <p className="text-[9px] font-black text-gray-400 uppercase">Bài viết</p>
              </div>
            </div>
            <button className="w-full mt-6 bg-gray-900 hover:bg-green-700 text-white font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-widest">
              Theo dõi chuyên gia
            </button>
          </div>

          {/* Related Posts */}
          <div className="space-y-6">
            <h3 className="font-black text-lg text-gray-900 flex items-center space-x-2">
              <Tag className="w-5 h-5 text-green-600" />
              <span>Bài viết liên quan</span>
            </h3>
            <div className="space-y-4">
              {relatedPosts.map((p: any) => (
                <Link key={p.id} href={`/posts/${p.slug}`} className="flex space-x-4 group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h5 className="font-black text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
                      {p.title}
                    </h5>
                    <p className="text-[10px] text-gray-400 font-medium mt-2">
                      {format(new Date(p.published_at), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </Link>
              ))}
              {relatedPosts.length === 0 && (
                <p className="text-xs text-gray-400 italic">Chưa có bài viết liên quan nào.</p>
              )}
            </div>
          </div>

          {/* Sticky Sidebar Ad/CTA */}
          <div className="sticky top-24 bg-gradient-to-br from-green-600 to-teal-700 rounded-[32px] p-8 text-white shadow-xl shadow-green-900/20">
            <h4 className="text-xl font-black mb-3">Tham gia cộng đồng Nhà nông</h4>
            <p className="text-xs text-white/80 leading-relaxed mb-6 font-medium">
              Nhận thông báo mới nhất về kỹ thuật canh tác và dự báo sâu bệnh từ chuyên gia.
            </p>
            <button className="w-full bg-white text-green-700 font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-widest hover:scale-105 active:scale-95">
              Đăng ký ngay
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
