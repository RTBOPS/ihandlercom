import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const services = [
  {
    title: 'Flight Planning',
    icon: '🗺️',
    items: [
      'ICAO flight plan filing and management',
      'Navigation log preparation',
      'Route optimization and airspace coordination',
      'Weather briefings and NOTAMs',
    ],
  },
  {
    title: 'International Permits',
    icon: '📄',
    items: [
      'Landing permit applications',
      'Overflight permit requests',
      'Diplomatic clearances',
      'Prior permission required (PPR) handling',
    ],
  },
  {
    title: 'Customs & Immigration',
    icon: '🛂',
    items: [
      'GENDEC preparation and filing',
      'eAPIS compliance (US)',
      'Crew and passenger documentation',
      'Airport of entry coordination',
    ],
  },
  {
    title: 'Ground Operations',
    icon: '🏢',
    items: [
      'FBO coordination and reservations',
      'Ground handler arrangements',
      'Fuel uplift and scheduling',
      'Catering and transportation',
    ],
  },
  {
    title: 'VIP Support',
    icon: '⭐',
    items: [
      'Dedicated trip support coordinator',
      'VIP lounge access arrangements',
      'Security and escort coordination',
      'Last-minute operational changes',
    ],
  },
  {
    title: 'Slot Management',
    icon: '🕐',
    items: [
      'Slot request and coordination',
      'Busy airport slot optimization',
      'Delay management',
      'Alternate airport planning',
    ],
  },
];

export default function FlightSupportPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              International Documentation for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">
                Private Aviation
              </span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We simplify international flight coordination, documentation, and permits — delivering
              precision, speed, and reliability for aviation professionals worldwide.
            </p>
          </div>

          {/* Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#F34707]/40 hover:shadow-md transition-all shadow-sm"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-gray-900 font-semibold text-lg mb-4">{s.title}</h3>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-[#F34707] mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center rounded-2xl border border-[#F34707]/20 bg-[#F34707]/5 p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to simplify your operations?</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Get in touch with our team and let us handle the complexity of international aviation
              operations so you can focus on flying.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors"
            >
              Get In Touch
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
