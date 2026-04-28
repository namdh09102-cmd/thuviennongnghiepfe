import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thuviennongnghiepfe.vercel.app';

  // Fetch all published posts
  const { data: posts } = await supabaseAdmin
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  // Fetch all categories
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug')
    .eq('is_active', true);

  // Fetch all public profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('username, created_at');

  const postUrls = (posts || []).map((post: any) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories || []).map((cat: any) => ({
    url: `${baseUrl}/posts?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const profileUrls = (profiles || []).map((profile: any) => ({
    url: `${baseUrl}/profile/${profile.username}`,
    lastModified: new Date(profile.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
    ...categoryUrls,
    ...profileUrls,
  ];
}
