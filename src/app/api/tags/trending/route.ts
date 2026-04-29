import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  if (!supabaseAdmin) {
    const fallbackTags = [
      { id: '1', name: 'Lúa' },
      { id: '2', name: 'Sầu riêng' },
      { id: '3', name: 'Phân bón' },
      { id: '4', name: 'Dưa lưới' },
      { id: '5', name: 'Thủy canh' },
      { id: '6', name: 'Cà phê' },
      { id: '7', name: 'Hồ tiêu' }
    ];
    return NextResponse.json(fallbackTags);
  }

  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('tags')
    .eq('status', 'published');

  if (error || !posts) {
    const fallbackTags = [
      { id: '1', name: 'Lúa' },
      { id: '2', name: 'Sầu riêng' },
      { id: '3', name: 'Phân bón' }
    ];
    return NextResponse.json(fallbackTags);
  }

  const tagCounts: { [key: string]: number } = {};
  posts.forEach((post: any) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => {
        const cleanTag = tag.trim();
        if (cleanTag) {
          tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
        }
      });
    } else if (post.tags && typeof post.tags === 'string') {
      // Support comma-separated strings
      post.tags.split(',').forEach((tag: string) => {
        const cleanTag = tag.trim();
        if (cleanTag) {
          tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
        }
      });
    }
  });

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([name], index) => ({ id: String(index + 1), name }));

  const fallbackTags = [
    { id: '1', name: 'Lúa' },
    { id: '2', name: 'Sầu riêng' },
    { id: '3', name: 'Phân bón' },
    { id: '4', name: 'Dưa lưới' },
    { id: '5', name: 'Cà phê' }
  ];

  return NextResponse.json(sortedTags.length > 0 ? sortedTags : fallbackTags);
}

