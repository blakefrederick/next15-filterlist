import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import DataComponent from '@/components/DataComponent';
import LoadTimeTracker from '@/components/LoadTimeTracker';
import Search from '@/components/Search';
import Skeleton from '@/components/ui/Skeleton';
import { getStaticData } from '@/data/getData';
import type { Metadata } from 'next';

export const experimental_ppr = true;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  description: 'Next.js 15 Filter List',
  title: 'Next.js 15 filtering list example using modern React features',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getStaticData();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="group">
          <div className="bg-blue-500 p-4 text-white">
            Statisk data
            {data[0].id}
          </div>
          <Suspense>
            <Suspense fallback={<Skeleton />}>
              <DataComponent />
            </Suspense>
            <Search />
          </Suspense>
          <Suspense fallback={<Skeleton />}>{children}</Suspense>
        </div>
        <LoadTimeTracker />
        <SpeedInsights />
      </body>
    </html>
  );
}
