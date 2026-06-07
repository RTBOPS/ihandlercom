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
            <a href="mailto:operation@i-handler.app" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              operation@i-handler.app
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
