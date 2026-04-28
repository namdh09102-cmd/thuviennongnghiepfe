import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thuviennongnghiepfe.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/profile/edit',
        '/login',
        '/register',
        '/search',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
