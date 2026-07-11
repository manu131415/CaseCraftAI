'use client';

import dynamic from 'next/dynamic';

const HomeContent = dynamic(() => import('./HomeContent'), {
  ssr: true,
  loading: () => <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>,
});

export default function Home() {
  return <HomeContent />;
}

