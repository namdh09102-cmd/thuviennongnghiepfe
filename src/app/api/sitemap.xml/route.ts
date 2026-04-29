import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET() {
  const baseUrl = 'https://thuviennongnghiepfe.vercel.app';

  try {
    await connectMongoDB();

    // Fetch all approved/published posts
    const posts = await Post.find({ 
      status: { $in: ['published', 'approved'] } 
    })
      .select('slug updated_at created_at')
      .sort({ created_at: -1 })
      .lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    posts.forEach((post: any) => {
      const date = post.updated_at || post.created_at || new Date();
      const lastMod = new Date(date).toISOString().split('T')[0];
      
      xml += `
  <url>
    <loc>${baseUrl}/posts/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.64</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
