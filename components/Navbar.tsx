'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const mainLinks = [
  { label: 'About Us',       href: '/#about' },
  { label: 'Flight Support', href: '/flight-support' },
  { label: 'Airport Search', href: '/airports' },
  { label: 'Customers',      href: '/customers' },
  { label: 'Pricing',        href: '/pricing' },
  { label: 'Contact',        href: '/contact' },
];

const appLinks = [
  { label: 'i-Handler App', href: '/app',    desc: 'Flight ops & trip planning' },
  { label: 'School',        href: '/school', desc: 'Aviation training platform' },
  { label: 'BHS',           href: '/bhs',    desc: 'Baggage handling system' },
  { label: 'GTPS',          href: '/gtps',   desc: 'Ground turnaround times' },
  { label: 'HRS',           href: '/hrs',    desc: 'HR & training compliance' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [mobileAppsOpen, setMobileAppsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAppsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
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
        <div className="hidden md:flex items-center gap-6">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}

          {/* Apps dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAppsOpen(!appsOpen)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap ${appsOpen ? 'text-[#F34707]' : 'text-gray-600 hover:text-gray-900'}`}>
              Apps
              <svg className={`w-4 h-4 transition-transform ${appsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {appsOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="py-1">
                  {appLinks.map((a) => (
                    <Link key={a.href} href={a.href}
                      onClick={() => setAppsOpen(false)}
                      className="flex flex-col px-4 py-3 hover:bg-gray-50 transition-colors group">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-[#F34707] transition-colors">{a.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{a.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auth + App icon */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/portal" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                My Portal
              </Link>
              <button onClick={handleSignOut}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold transition-colors">
              Owner Login
            </Link>
          )}
          <a href="https://i-handler.app" target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 hover:opacity-85 transition-opacity" title="Open i-Handler App">
            <Image src="/images/logo-square.png" alt="i-Handler.app" width={36} height={36}
              className="h-9 w-9 object-contain rounded-lg shadow-sm" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 shadow-lg">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium py-1"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}

          {/* Mobile apps section */}
          <div>
            <button onClick={() => setMobileAppsOpen(!mobileAppsOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 py-1 w-full">
              Apps
              <svg className={`w-4 h-4 transition-transform ${mobileAppsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {mobileAppsOpen && (
              <div className="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-[#F34707]/30 pl-3">
                {appLinks.map((a) => (
                  <Link key={a.href} href={a.href}
                    className="text-sm text-gray-600 hover:text-[#F34707] font-medium py-1 transition-colors"
                    onClick={() => { setMenuOpen(false); setMobileAppsOpen(false); }}>
                    {a.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
