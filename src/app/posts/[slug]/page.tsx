import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
import dynamic from 'next/dynamic';
import PostContent from '@/components/PostContent';

const CommentSection = dynamic(() => import('@/components/CommentSection'), {
  ssr: false,
  loading: () => <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest py-10">Đang tải bình luận...</p>
});
import PostActions from '@/components/PostActions';
import PostCard from '@/components/PostCard';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import mongoose from 'mongoose';

const MOCK_POSTS = [
  {
    id: 'mock-post-1',
    slug: 'ky-thuat-trong-sau-rieng-ri6',
    title: 'Kỹ thuật trồng sầu riêng Ri6 đạt năng suất cao',
    content: '<p>Sầu riêng Ri6 là giống cây ăn trái có giá trị kinh tế cao...</p><p>Chăm sóc sầu riêng đòi hỏi kỹ thuật cao, nhất là khâu tỉa cành và điều tiết nước...</p>',
    excerpt: 'Chia sẻ bí quyết bón phân và chăm sóc sầu riêng giai đoạn làm bông.',
    thumbnail_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
    status: 'published',
    tags: ['Sầu riêng', 'Trồng trọt', 'Ri6'],
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    view_count: 1250,
    like_count: 42,
    comment_count: 15,
    author: {
      id: 'chuyengia1',
      username: 'chuyengianongnghiep',
      full_name: 'GS.TS Nguyễn Văn A',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert',
      role: 'Chuyên gia',
      bio: 'Chuyên gia tư vấn nông nghiệp'
    },
    category: {
      id: 1,
      name: 'Trồng trọt',
      slug: 'trong-trot'
    }
  },
  {
    id: 'mock-post-2',
    slug: 'phong-tru-benh-dao-on-lua',
    title: 'Cách phòng trừ bệnh đạo ôn trên lúa vụ Đông Xuân',
    content: '<p>Bệnh đạo ôn do nấm Pyricularia oryzae gây ra...</p>',
    excerpt: 'Nhận biết sớm dấu hiệu bệnh và các loại thuốc đặc trị hiệu quả.',
    thumbnail_url: 'https://images.unsplash.com/photo-1536638317175-32449e148ced?w=800',
    status: 'published',
    tags: ['Lúa', 'Sâu bệnh'],
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    view_count: 840,
    like_count: 31,
    comment_count: 8,
    author: {
      id: 'chuyengia2',
      username: 'kstruongvanphuc',
      full_name: 'KS. Trương Văn Phúc',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Phuc',
      role: 'Kỹ sư',
      bio: 'Kỹ sư bảo vệ thực vật'
    },
    category: {
      id: 2,
      name: 'Sâu bệnh',
      slug: 'sau-benh'
    }
  },
  {
    id: 'mock-post-3',
    slug: 'quy-trinh-bon-phan-buoi-da-xanh',
    title: 'Quy trình bón phân cho bưởi da xanh giai đoạn nuôi trái',
    content: '<p>Giai đoạn nuôi trái quyết định chất lượng...</p>',
    excerpt: 'Hướng dẫn bón phân đạm, lân, kali cân đối giúp trái to, bóng đẹp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25?w=800',
    status: 'published',
    tags: ['Bưởi', 'Phân bón'],
    published_at: new Date().toISOString(),
    author: { full_name: 'KS. Trương Văn Phúc', avatar_url: '' },
    category: { name: 'Phân bón', slug: 'phan-bon' }
  },
  {
    id: 'mock-post-4',
    slug: 'ky-thuat-nuoi-bo-vo-beo',
    title: 'Kỹ thuật nuôi bò vỗ béo theo hướng an toàn sinh học',
    content: '<p>Nuôi bò vỗ béo mang lại nguồn thu nhập ổn định...</p>',
    excerpt: 'Xây dựng khẩu phần ăn và lịch tiêm phòng vắc-xin cho bò thịt.',
    thumbnail_url: 'https://images.unsplash.com/photo-1545466226-ddba60a43ed6?w=800',
    status: 'published',
    tags: ['Chăn nuôi', 'Bò thịt'],
    published_at: new Date().toISOString(),
    category: { name: 'Chăn nuôi', slug: 'chan-nuoi' }
  },
  {
    id: 'mock-post-5',
    slug: 'ung-dung-iot-tuoi-thong-minh',
    title: 'Ứng dụng IoT trong quản lý nước tưới thông minh',
    content: '<p>Công nghệ IoT giúp tự động hóa hệ thống tưới tiêu...</p>',
    excerpt: 'Tiết kiệm 40% lượng nước và tối ưu hóa chi phí nhân công.',
    thumbnail_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
    status: 'published',
    tags: ['Nông nghiệp số', 'IoT'],
    published_at: new Date().toISOString(),
    category: { name: 'Nông nghiệp số', slug: 'nong-nghiep-so' }
  },
  {
    id: 'mock-post-6',
    slug: 'mo-hinh-nuoi-cua-dong',
    title: 'Bí quyết làm giàu từ mô hình nuôi cua đồng trong bể xi măng',
    content: '<p>Nuôi cua đồng trong bể xi măng dễ quản lý...</p>',
    excerpt: 'Cách thiết kế bể nuôi, quản lý nguồn nước và thức ăn cho cua.',
    thumbnail_url: 'https://images.unsplash.com/photo-1614548331473-71e5b13f7f80?w=800',
    status: 'published',
    tags: ['Chăn nuôi', 'Cua đồng'],
    published_at: new Date().toISOString(),
    category: { name: 'Chăn nuôi', slug: 'chan-nuoi' }
  },
  {
    id: 'mock-post-7',
    slug: 'xu-ly-rom-ra-sinh-hoc',
    title: 'Xử lý rơm rạ bằng chế phẩm sinh học sau thu hoạch',
    content: '<p>Đốt rơm rạ gây ô nhiễm môi trường...</p>',
    excerpt: 'Ủ rơm rạ thành phân bón hữu cơ cải tạo đất cực tốt.',
    thumbnail_url: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800',
    status: 'published',
    tags: ['Phân bón', 'Sinh học'],
    published_at: new Date().toISOString(),
    category: { name: 'Phân bón', slug: 'phan-bon' }
  },
  {
    id: 'mock-post-8',
    slug: 'phong-tri-nhen-do-cay-co-mui',
    title: 'Nhận biết và phòng trị nhện đỏ hại cây có múi',
    content: '<p>Nhện đỏ chích hút làm vàng lá...</p>',
    excerpt: 'Các biện pháp sinh học và hóa học kiểm soát nhện đỏ hiệu quả.',
    thumbnail_url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800',
    status: 'published',
    tags: ['Sâu bệnh', 'Cây có múi'],
    published_at: new Date().toISOString(),
    category: { name: 'Sâu bệnh', slug: 'sau-benh' }
  },
  {
    id: 'mock-post-9',
    slug: 'trong-rau-thuy-canh-tai-gia',
    title: 'Kỹ thuật trồng rau thủy canh quy mô gia đình',
    content: '<p>Trồng rau thủy canh cung cấp nguồn rau sạch...</p>',
    excerpt: 'Thiết kế giàn thủy canh hồi lưu đơn giản, chi phí thấp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    status: 'published',
    tags: ['Trồng trọt', 'Thủy canh'],
    published_at: new Date().toISOString(),
    category: { name: 'Trồng trọt', slug: 'trong-trot' }
  },
  {
    id: 'mock-post-10',
    slug: 'drone-phun-thuoc-bvtv',
    title: 'Sử dụng drone phun thuốc BVTV: Lợi ích và lưu ý',
    content: '<p>Máy bay không người lái (drone) đang thay đổi...</p>',
    excerpt: 'Tăng hiệu quả dập dịch, bảo vệ sức khỏe người nông dân.',
    thumbnail_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    status: 'published',
    tags: ['Nông nghiệp số', 'Drone'],
    published_at: new Date().toISOString(),
    category: { name: 'Nông nghiệp số', slug: 'nong-nghiep-so' }
  }
];

export const revalidate = 3600; // ISR: Revalidate every 1 hour
export const dynamicParams = true; // SSR for non-prerendered slugs

async function getPost(slug: string) {
  try {
    await connectMongoDB();

    const mongoPost = await Post.findOne({ slug }).lean();
    if (mongoPost) {
      const postObj: any = { ...mongoPost, id: (mongoPost as any)._id?.toString() };

      // Resolve author from users collection
      try {
        if (postObj.author_id) {
          let authorQuery: any = {};
          try {
            authorQuery = { _id: new mongoose.Types.ObjectId(postObj.author_id) };
          } catch { authorQuery = { email: postObj.author_id }; }

          const user = await mongoose.connection.db!.collection('users').findOne(authorQuery);
          if (user) {
            postObj.author = {
              full_name: user.name || user.email || 'Người dùng',
              username: user.email?.split('@')[0] || 'member',
              avatar_url: user.image || '',
              bio: user.bio || '',
              role: user.role || 'Thành viên',
              is_verified: user.is_verified || false,
              points: user.points || 0,
            };
          }
        }
      } catch (e) { console.error('Author resolve failed:', e); }

      // Resolve category
      try {
        if (postObj.category_id && !postObj.category) {
          const cat = await Category.findOne({
            $or: [
              { slug: postObj.category_id },
              ...(mongoose.isValidObjectId(postObj.category_id)
                ? [{ _id: new mongoose.Types.ObjectId(postObj.category_id) }]
                : []),
            ],
          }).lean();
          if (cat) postObj.category = { name: (cat as any).name, slug: (cat as any).slug };
        }
      } catch (e) { console.error('Category resolve failed:', e); }

      if (!postObj.author) postObj.author = { full_name: 'Thành viên TVNN', avatar_url: '', role: 'Thành viên' };
      if (!postObj.category) postObj.category = { name: 'Chưa phân loại', slug: 'uncategorized' };

      return postObj;
    }

    // Final fallback to MOCK_POSTS
    return MOCK_POSTS.find(p => p.slug === slug) || null;
  } catch (err) {
    console.error('Error in getPost:', err);
    return MOCK_POSTS.find(p => p.slug === slug) || null;
  }
}

async function getRelatedPosts(categorySlug: string, currentSlug: string) {
  try {
    await connectMongoDB();

    const related = await Post.find({
      'category.slug': categorySlug,
      slug: { $ne: currentSlug },
      status: 'published',
    })
      .limit(4)
      .lean();

    if (related.length === 0) return [];

    return related.map((p: any) => ({
      ...p,
      id: p._id?.toString(),
      author: p.author || { full_name: 'Thành viên', avatar_url: '' },
      category: p.category || { name: 'Chưa phân loại', slug: 'uncategorized' },
    }));
  } catch (err) {
    console.error('getRelatedPosts failed:', err);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    await connectMongoDB();
    const posts = await Post.find({ status: 'published' }).select('slug').limit(50).lean();
    return posts.map((p: any) => ({ slug: p.slug }));
  } catch (err) {
    console.error('generateStaticParams failed:', err);
    return MOCK_POSTS.map(p => ({ slug: p.slug }));
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };

  const authorName = post.author?.full_name || 'Thành viên TVNN';
  const metaDescription = post.excerpt?.slice(0, 160) || post.content?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Chia sẻ kinh nghiệm, kỹ thuật canh tác, hỏi đáp chuyên gia nông nghiệp Việt Nam';

  return {
    title: `${post.title} | Thư Viện Nông Nghiệp`,
    description: metaDescription,
    openGraph: {
      title: post.title,
      description: post.excerpt || metaDescription,
      images: [{ url: post.thumbnail_url || 'https://thuviennongnghiep.vn/og-image.png', width: 1200, height: 630, alt: post.title }],
      type: 'article',
      publishedTime: post.created_at,
      authors: [authorName],
    },
    alternates: { canonical: `https://thuviennongnghiep.vn/posts/${post.slug}` }
  };
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const author = post.author || {
    full_name: 'Thành viên TVNN',
    username: 'tvnn',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TVNN',
    role: 'Thành viên',
    bio: 'Người yêu nông nghiệp',
    points: 0,
    is_verified: false
  };

  const relatedPosts = post.category?.slug ? await getRelatedPosts(post.category.slug, post.slug) : [];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thuviennongnghiepfe.vercel.app';
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
      name: author.full_name,
      url: `${baseUrl}/profile/${author.username}`,
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': 'https://thuviennongnghiep.vn' },
              { '@type': 'ListItem', 'position': 2, 'name': post.category?.name || 'Bài viết', 'item': `https://thuviennongnghiep.vn/posts?category=${post.category?.slug || 'all'}` },
              { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': `https://thuviennongnghiep.vn/posts/${post.slug}` }
            ]
          })
        }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-green-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        {post.category && (
          <>
            <Link href={`/posts?category=${post.category.slug}`} className="hover:text-green-600 transition-colors">
              {post.category.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
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
                  <Image
                    src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Author'}
                    alt={author.full_name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                    width={80}
                    height={80}
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
                  />
                  {author.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-none mb-1">{author.full_name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{author.role || 'Chuyên gia'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-xs font-bold text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>{post.published_at ? format(new Date(post.published_at), 'dd/MM/yyyy', { locale: vi }) : 'Vừa mới'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>{post.content ? Math.ceil(post.content.length / 1000) : 1} phút đọc</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden shadow-2xl shadow-green-900/10 group">
              <Image
                src={post.thumbnail_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                width={800}
                height={450}
                priority
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
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
            <Image
              src={author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Author'}
              alt={author.full_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-green-50 shadow-md object-cover"
              width={160}
              height={160}
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
            />
            <h4 className="font-black text-lg text-gray-900 mb-1">{author.full_name}</h4>
            <p className="text-xs text-gray-500 font-medium mb-4">{author.bio || 'Chuyên gia tư vấn kỹ thuật nông nghiệp tại Thư viện Nông nghiệp.'}</p>
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
              <div>
                <p className="text-xl font-black text-green-600">{author.points || 0}</p>
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
                    <Image 
                      src={p.thumbnail_url} 
                      alt={p.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      width={400}
                      height={225}
                      placeholder="blur"
                      blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h5 className="font-black text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
                      {p.title}
                    </h5>
                    <p className="text-[10px] text-gray-400 font-medium mt-2">
                      {p.published_at ? format(new Date(p.published_at), 'dd/MM/yyyy', { locale: vi }) : 'Vừa mới'}
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
