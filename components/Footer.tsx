import Link from 'next/link';
import Image from 'next/image';

const aircraftBrands = [
  { src: '/images/brands/BombardierWT.png',         alt: 'Bombardier' },
  { src: '/images/brands/learjetWT.png',            alt: 'Learjet' },
  { src: '/images/brands/gulstreamWT.png',          alt: 'Gulfstream' },
  { src: '/images/brands/cessnaWT.png',             alt: 'Cessna' },
  { src: '/images/brands/AirbusWT.png',             alt: 'Airbus' },
  { src: '/images/brands/BoeingWT.png',             alt: 'Boeing' },
  { src: '/images/brands/EmbraerWT.png',            alt: 'Embraer' },
  { src: '/images/brands/pilatusWT.png',            alt: 'Pilatus' },
  { src: '/images/brands/beachcraftWT.png',         alt: 'Beechcraft' },
  { src: '/images/brands/nbaa-main-logo-white.png', alt: 'NBAA' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/footer.mp4"
      />
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Content */}
      <div className="relative z-10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1">
              <Image src="/images/I-HANDLER_APP_LOGO.png" alt="i-Handler" width={120} height={48}
                className="h-8 w-auto object-contain mb-4 brightness-0 invert" />
              <p className="text-sm text-gray-400 leading-relaxed">The new standard in global aviation operations.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="https://i-handler.app" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">i-Handler App</a></li>
                <li><Link href="/school" className="text-sm text-gray-400 hover:text-white transition-colors">i-Handler School</Link></li>
                <li><Link href="/flight-support" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Airport Search', href: '/airports' },
                  { label: 'Flight Support', href: '/flight-support' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Customers', href: '/customers' },
                  { label: 'Contact Us', href: '/contact' },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Owner Portal</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} i-Handler. All rights reserved.</p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {/* YouTube */}
              <a href="https://www.youtube.com/@i-HandlerApp" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors" title="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/ihandlerapp" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors" title="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/share/1BuZD7q2Vg/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors" title="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
            <a href="mailto:operations@i-handler.app" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              operations@i-handler.app
            </a>
          </div>
        </div>
      </div>

      {/* ── Aircraft brands marquee strip ─────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/5 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap items-center gap-14 px-8">
          {[...aircraftBrands, ...aircraftBrands].map((brand, i) => (
            <div key={i} className="flex-shrink-0 h-7 flex items-center">
              <Image
                src={brand.src}
                alt={brand.alt}
                width={110}
                height={28}
                className="h-6 w-auto object-contain opacity-50 hover:opacity-90 transition-opacity brightness-0 invert"
              />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
