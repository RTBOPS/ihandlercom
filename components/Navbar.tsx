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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/60 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/I-HANDLER_APP_LOGO.png"
            alt="i-Handler"
            width={140}
            height={56}
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/portal"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                My Portal
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white font-medium transition-colors"
            >
              Owner Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-white/80 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
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
        <div className="md:hidden bg-black/90 border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/80 hover:text-white transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-4">
            {user ? (
              <>
                <Link href="/portal" className="block text-sm text-white/80 hover:text-white py-1" onClick={() => setMenuOpen(false)}>
                  My Portal
                </Link>
                <button onClick={handleSignOut} className="mt-2 text-sm text-white/60 hover:text-white">
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block text-center text-sm px-4 py-2 rounded-lg bg-[#F34707] text-white font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Owner Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
