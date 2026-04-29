import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../lib/react-query";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import ToastContainer from "../components/ToastContainer";
import BottomNav from "../components/BottomNav";
import FabButton from "../components/FabButton";
import AuthProvider from "../components/AuthProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL('https://thuviennongnghiep.vn'),
  title: { 
    default: 'Thư viện Nông nghiệp — Cộng đồng nông dân Việt Nam', 
    template: '%s | Thư viện Nông nghiệp' 
  },
  description: 'Chia sẻ kinh nghiệm, kỹ thuật canh tác, hỏi đáp chuyên gia nông nghiệp Việt Nam',
  keywords: ['nông nghiệp', 'canh tác', 'phân bón', 'sâu bệnh', 'lúa', 'sầu riêng'],
  openGraph: { 
    type: 'website', 
    locale: 'vi_VN', 
    siteName: 'Thư viện Nông nghiệp',
    url: '/',
  },
  twitter: { 
    card: 'summary_large_image' 
  },
  robots: { 
    index: true, 
    follow: true 
  },
  alternates: {
    canonical: '/',
  },
};

import PushNotificationManager from "../components/PushNotificationManager";
import { Analytics } from "@vercel/analytics/react";

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
            <PushNotificationManager />
            <OfflineBanner />
            <ToastContainer />
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 pb-24 lg:pb-12 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
              {children}
            </main>
            <Analytics />
            <FabButton />
            <BottomNav />
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
