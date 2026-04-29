'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MyProfileRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      const username = (session.user as any).username;
      if (username) {
        router.push(`/users/${username}`);
      } else {
        router.push('/settings/profile');
      }
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đang chuyển hướng...</p>
    </div>
  );
}
