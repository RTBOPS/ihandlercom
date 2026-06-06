import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
          <div className="absolute inset-0 -z-10"
            style={{ backgroundImage: 'radial-gradient(ellipse 60% 50% at 70% 50%, #fff3ef 0%, transparent 70%)' }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 border border-[#F34707]/20 text-[#F34707] text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F34707] animate-pulse" />
                International Aviation Operations
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                The New and Smart Way to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">
                  Manage International Private Aviation
                </span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-xl">
                We offer an intelligent, streamlined solution for managing international aviation
                documentation, including landing and overflight permits, navigation logs, GENDEC,
                ICAO flight plans, eAPIS compliance, FBO coordination, and ground handling requests.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"
                  className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-orange-200">
                  Get In Touch
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/flight-support"
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition-colors flex items-center gap-2">
                  Browse our services
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F34707]/10 to-[#FC8C00]/10 rounded-3xl blur-3xl -z-10 scale-110" />
                <Image src="/images/I-HANDLER_APP_LOGO.png" alt="i-Handler App" width={480} height={360}
                  className="w-full h-auto object-contain rounded-2xl" priority />
              </div>
            </div>
          </div>
        </section>

        {/* About / Why Us */}
        <section id="about" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Unlike any other flight support agency you&apos;ve worked with before
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Designed with meticulous precision and engineered for global aviation, i-Handler
                combines operational excellence with seamless international coordination.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '✈️', title: 'Global Permits & Overflights', desc: 'Landing and overflight permits managed quickly and accurately across all international jurisdictions.' },
                { icon: '📋', title: 'ICAO Flight Plans & GENDEC', desc: 'Complete documentation support including ICAO flight plans, GENDEC, and eAPIS compliance.' },
                { icon: '🏢', title: 'FBO & Ground Handling', desc: 'Direct coordination with FBOs and handlers worldwide for seamless ground operations.' },
                { icon: '📱', title: 'Built for Mobile', desc: 'Optimized for smartphones and tablets, giving you full operational control on the go.' },
                { icon: '🌍', title: 'Worldwide Coverage', desc: 'Access a comprehensive database of airports, handlers, and FBOs across the globe.' },
                { icon: '⚡', title: 'Fast Response', desc: 'Dedicated support for private and business aviation with rapid turnaround for urgent requests.' },
              ].map((item) => (
                <div key={item.title}
                  className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#F34707]/40 hover:shadow-md transition-all">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Airport Search CTA */}
        <section className="py-20 bg-[#F34707]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Worldwide Gateway for Aviation Services
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Search airports worldwide and instantly find handlers, FBOs, contacts, and operational information.
            </p>
            <Link href="/airports"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#F34707] font-bold text-base transition-colors hover:bg-gray-100 shadow-lg">
              Search Airports
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Clients */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-8">
              Trusted by aviation professionals worldwide
            </p>
            <p className="text-gray-600 text-base leading-relaxed max-w-3xl mx-auto">
              Over the years, i-Handler has supported a wide range of business aviation operators,
              charter companies, and flight departments delivering seamless handling and flight support worldwide.
            </p>
            <div className="mt-8">
              <Link href="/customers"
                className="inline-flex items-center gap-2 text-sm text-[#F34707] hover:text-[#d93d06] transition-colors font-semibold">
                View our customers
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
