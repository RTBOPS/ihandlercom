import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1">
            <Image
              src="/images/I-HANDLER_APP_LOGO.png"
              alt="i-Handler"
              width={120}
              height={48}
              className="h-8 w-auto object-contain mb-4"
            />
            <p className="text-sm text-white/50 leading-relaxed">
              The new standard in global aviation operations.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://i-handler.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  i-Handler App
                </a>
              </li>
              <li>
                <Link href="/flight-support" className="text-sm text-white/50 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              {[
                { label: 'Airport Search', href: '/airports' },
                { label: 'Flight Support', href: '/flight-support' },
                { label: 'Customers', href: '/customers' },
                { label: 'Contact Us', href: '/contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Owner Portal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-white/50 hover:text-white transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} i-Handler. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            <a href="mailto:operation@i-handler.app" className="hover:text-white/60 transition-colors">
              operation@i-handler.app
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
