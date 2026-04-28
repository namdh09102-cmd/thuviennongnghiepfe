import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../lib/react-query";
import Header from "../components/Header";
import OfflineBanner from "../components/OfflineBanner";
import ToastContainer from "../components/ToastContainer";
import BottomNav from "../components/BottomNav";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thư viện Nông nghiệp",
  description: "Chia sẻ kiến thức và giải đáp thắc mắc nông nghiệp chuẩn chuyên gia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col overflow-x-hidden`}>
        <SessionProvider>
          <ReactQueryProvider>
            <OfflineBanner />
            <ToastContainer />
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6 pb-24 lg:pb-12 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
              {children}
            </main>
            <BottomNav />
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
