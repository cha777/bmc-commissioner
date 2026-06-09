import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
import { SyncProvider } from '@/components/sync-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Bandula Metal Crusher | Pro',
  description: 'Daily production, commission, and operational tracking for Bandula Metal Crusher.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className='dark'
    >
      <body className={`${inter.variable} font-sans antialiased bg-background overflow-hidden`}>
        <div className='fixed inset-0 z-[-1] overflow-hidden pointer-events-none'>
          <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]' />
          <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/10 blur-[120px]' />
        </div>
        <SyncProvider>
          <main className='h-[calc(100vh-3rem)] flex flex-col pb-20 overflow-y-auto relative z-10'>{children}</main>
          <BottomNav />
        </SyncProvider>
      </body>
    </html>
  );
}
