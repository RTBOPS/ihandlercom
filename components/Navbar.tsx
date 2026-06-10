'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'About Us', href: '/#about' },
  { label: 'Flight Support', href: '/flight-support' },
  { label: 'Airport Search', href: '/airports' },
  { label: 'Customers', href: '/customers' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo — links home */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/">
            <Image
              src="/images/I-HANDLER_APP_LOGO.png"
              alt="i-Handler"
              width={140}
              height={56}
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth + App icon */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/portal" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                My Portal
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold transition-colors"
            >
              Owner Login
            </Link>
          )}
          {/* App link — square logo, far right */}
          <a
            href="https://i-handler.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 hover:opacity-85 transition-opacity"
            title="Open i-Handler App"
          >
            <Image
              src="/images/logo-square.png"
              alt="i-Handler.app"
              width={36}
              height={36}
              className="h-9 w-9 object-contain rounded-lg shadow-sm"
            />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-lg">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium py-1"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <>
                <Link href="/portal" className="block text-sm text-gray-700 font-medium py-1" onClick={() => setMenuOpen(false)}>My Portal</Link>
                <button onClick={handleSignOut} className="mt-2 text-sm text-gray-500 hover:text-gray-900">Sign Out</button>
              </>
            ) : (
              <Link href="/login"
                className="block text-center text-sm px-4 py-2 rounded-lg bg-[#F34707] text-white font-semibold"
                onClick={() => setMenuOpen(false)}>
                Owner Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
