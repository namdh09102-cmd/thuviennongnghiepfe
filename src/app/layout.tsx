import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../lib/react-query";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import ToastContainer from "../components/ToastContainer";
import BottomNav from "../components/BottomNav";
import AuthProvider from "../components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Thư viện Nông nghiệp AgriLib - Cộng đồng nông dân Việt Nam",
    template: "%s | AgriLib"
  },
  description: "Chia sẻ kiến thức, kỹ thuật canh tác và giải đáp thắc mắc nông nghiệp chuẩn chuyên gia. Cộng đồng kết nối nông dân và chuyên gia hàng đầu Việt Nam.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thuviennongnghiepfe.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Thư viện Nông nghiệp AgriLib",
    description: "Cộng đồng chia sẻ kiến thức nông nghiệp hàng đầu Việt Nam",
    url: '/',
    siteName: 'AgriLib',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AgriLib - Thư viện Nông nghiệp',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Thư viện Nông nghiệp AgriLib",
    description: "Cộng đồng chia sẻ kiến thức nông nghiệp hàng đầu Việt Nam",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col overflow-x-hidden`}>
        <AuthProvider>
          <ReactQueryProvider>
            <OfflineBanner />
            <ToastContainer />
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 pb-24 lg:pb-12 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
              {children}
            </main>
            <BottomNav />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
