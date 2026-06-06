import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'i-Handler — International Aviation Operations',
  description:
    'Intelligent, streamlined solution for managing international aviation documentation, permits, FBO coordination, and ground handling.',
  icons: { icon: '/images/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
