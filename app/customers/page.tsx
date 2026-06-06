import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function CustomersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-950">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <section className="relative pt-36 pb-20 px-4 overflow-hidden">
          {/* Client logos as full background */}
          <div className="absolute inset-0">
            <Image
              src="/images/clients-dark.gif"
              alt=""
              fill
              className="object-cover object-top opacity-20"
              unoptimized
            />
          </div>
          {/* Gradient: readable top + fades into dark below */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
              Our Clients
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">
              Trusted by aviation professionals worldwide
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              Over the years, i-Handler has supported charter operators, flight departments,
              handling companies, and military contractors across six continents — delivering
              seamless permits, ground handling, and flight support worldwide.
            </p>
          </div>
        </section>

        {/* ── Full logos image ─────────────────────────────────────────────── */}
        <section className="relative px-4 pb-24">
          <div className="max-w-5xl mx-auto">

            {/* Stat strip */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { value: '100+', label: 'Companies served' },
                { value: '6',    label: 'Continents covered' },
                { value: '15+',  label: 'Years of experience' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                  <p className="text-3xl font-bold text-[#F34707]">{s.value}</p>
                  <p className="text-sm text-white/40 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Logo grid image — full width, no clipping */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/clients-dark.gif"
                alt="i-Handler client logos — over 100 aviation companies worldwide"
                width={980}
                height={3000}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="px-4 pb-24">
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-[#F34707]/30 bg-[#F34707]/10 p-10">
            <h2 className="text-2xl font-bold text-white mb-3">Join our network</h2>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Are you an FBO or ground handler? Get listed in our worldwide directory and
              connect with aviation operators globally.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register"
                className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors shadow-lg">
                Register Your Company
              </Link>
              <Link href="/contact"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
