import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';

const services = [
  'Dedicated support for private and business aviation',
  'Global coordination for VIP ground handling',
  'Fast response for permits, slots, and flight support',
  'Personalized service tailored to each mission',
  'Trip planning and flight coordination',
  'Handling requests and FBO arrangements',
  'Permit, overflight, and landing support',
  'Last-minute or urgent operational needs',
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00] mb-4">
              Contact Us
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Services checklist */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">How we can help you</h2>
              <ul className="space-y-4">
                {services.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#F34707] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/70 text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/40 text-sm">
                  You can also reach us directly at{' '}
                  <a href="mailto:operation@i-handler.app" className="text-[#F34707] hover:text-[#FC8C00] transition-colors">
                    operation@i-handler.app
                  </a>
                </p>
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
