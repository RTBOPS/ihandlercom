import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IhIcon from '@/components/IhIcon';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-end pb-16 pt-16 overflow-hidden bg-black">

          {/* Full-bleed background video */}
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/promo.mp4"
            poster="/images/plane-B.png"
          />

          {/* Base white-tinted overlay to soften video and help all text */}
          <div className="absolute inset-0 bg-white/20" />
          {/* Directional darks for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

          {/* Content */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F34707] animate-pulse" />
                International Aviation Operations
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                The Smart Way to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">
                  Manage International Private Aviation
                </span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
                Intelligent, streamlined flight support — landing permits, navigation logs,
                GENDEC, ICAO flight plans, eAPIS, FBO coordination, and ground handling,
                all in one platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/contact"
                  className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/40">
                  Get In Touch
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/airports"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm transition-colors flex items-center gap-2">
                  Search Airports
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-12 flex flex-wrap gap-10 border-t border-white/10 pt-10">
                {[
                  { value: '10,000+', label: 'Airports' },
                  { value: '190+',    label: 'Countries' },
                  { value: '24 / 7',  label: 'Support' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-sm text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Us ───────────────────────────────────────────────────────── */}
        <section id="about" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
                Why i-Handler
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Unlike any other flight support agency
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Designed with meticulous precision and engineered for global aviation, i-Handler
                combines operational excellence with seamless international coordination.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <IhIcon name="aircraft" className="w-8 h-8" />,
                  title: 'Global Permits & Overflights',
                  desc: 'Landing and overflight permits managed quickly and accurately across all international jurisdictions.',
                },
                {
                  icon: <IhIcon name="runway" className="w-8 h-8" />,
                  title: 'ICAO Flight Plans & GENDEC',
                  desc: 'Complete documentation support including ICAO flight plans, GENDEC, and eAPIS compliance.',
                },
                {
                  icon: <IhIcon name="fbo" className="w-8 h-8" />,
                  title: 'FBO & Ground Handling',
                  desc: 'Direct coordination with FBOs and handlers worldwide for seamless ground operations.',
                },
                {
                  icon: <IhIcon name="pilot" className="w-8 h-8" />,
                  title: 'Built for Crews',
                  desc: 'Optimized for pilots and flight crew — full operational control at your fingertips, anywhere.',
                },
                {
                  icon: <IhIcon name="handler" className="w-8 h-8" />,
                  title: 'Worldwide Coverage',
                  desc: 'Access a comprehensive database of airports, handlers, and FBOs across the globe.',
                },
                {
                  icon: <IhIcon name="fuel" className="w-8 h-8" />,
                  title: 'Fast Response',
                  desc: 'Dedicated support for private and business aviation with rapid turnaround for urgent requests.',
                },
              ].map((item) => (
                <div key={item.title}
                  className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#F34707]/40 hover:shadow-md transition-all group">
                  <div className="text-[#F34707] mb-4 group-hover:scale-110 transition-transform origin-left">
                    {item.icon}
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Directory showcase ────────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left: text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
                  Aviation Directory
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Every airport. Every service.{' '}
                  <span className="text-[#F34707]">All in one place.</span>
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  Our database covers handlers, FBOs, hotels, catering, car rentals,
                  and fuel services at thousands of airports worldwide — always kept
                  up to date by the operators themselves.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href="/airports"
                    className="px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors shadow-md">
                    Search the Directory
                  </Link>
                  <Link href="/pricing"
                    className="px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-sm transition-colors">
                    View Pricing
                  </Link>
                </div>
              </div>

              {/* Right: service icon grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'handler'  as const, label: 'Ground Handlers' },
                  { name: 'fbo'      as const, label: 'FBOs' },
                  { name: 'fuel'     as const, label: 'Fuel Services' },
                  { name: 'hotel'    as const, label: 'Hotels' },
                  { name: 'catering' as const, label: 'Catering' },
                  { name: 'limo'     as const, label: 'Car Rentals' },
                ].map((item) => (
                  <div key={item.name}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#F34707]/40 hover:shadow-md transition-all group cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-[#F34707]/10 flex items-center justify-center text-[#F34707] group-hover:bg-[#F34707] group-hover:text-white transition-colors p-2.5">
                      <IhIcon name={item.name} className="w-full h-full" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Marshaller full-bleed ─────────────────────────────────────────── */}
        <section className="relative h-72 sm:h-96 overflow-hidden">
          <Image src="/images/Marshaller.png" alt="Ground handler marshalling aircraft"
            fill className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">
                Trusted by aviation professionals worldwide
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-xl">
                From the ramp to the runway — we have you covered.
              </h2>
              <Link href="/customers" className="mt-6 inline-flex items-center gap-2 text-[#F34707] font-semibold text-sm hover:text-orange-400 transition-colors">
                Meet our customers
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Clients section ───────────────────────────────────────────────── */}
        <section className="py-24 bg-gray-950 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: text */}
              <div className="lg:sticky lg:top-32">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-semibold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
                  Our Clients
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Trusted by the world&apos;s aviation professionals
                </h2>
                <p className="text-white/50 text-base leading-relaxed mb-8">
                  Over the years i-Handler has supported charter operators, flight departments,
                  handling companies, and military contractors across six continents —
                  delivering seamless permits, ground handling, and flight support worldwide.
                </p>
                <Link href="/customers"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors shadow-lg">
                  View all clients
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Count callout */}
                <div className="mt-10 grid grid-cols-2 gap-4">
                  {[
                    { value: '100+', label: 'Companies served' },
                    { value: '6',    label: 'Continents covered' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                      <p className="text-3xl font-bold text-[#F34707]">{s.value}</p>
                      <p className="text-sm text-white/40 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: scrollable logo image */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[600px] overflow-y-auto scrollbar-hide">
                {/* top fade */}
                <div className="sticky top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none" />
                <Image
                  src="/images/clients-dark.gif"
                  alt="i-Handler client logos"
                  width={780}
                  height={2400}
                  className="w-full h-auto"
                  unoptimized
                />
                {/* bottom fade */}
                <div className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Airport Search CTA ────────────────────────────────────────────── */}
        <section className="py-20 bg-[#F34707]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white p-3">
                <IhIcon name="runway" className="w-full h-full" />
              </div>
            </div>
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

      </main>
      <Footer />
    </>
  );
}
