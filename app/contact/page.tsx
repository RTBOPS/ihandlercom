import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from './ContactForm';
import Image from 'next/image';

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
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00] mb-4">
              Contact Us
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: image + services */}
            <div>
              {/* Ramp photo — grayscale with i-Handler logo in orange */}
              <div className="mb-8 rounded-2xl overflow-hidden shadow-lg relative">
                <Image
                  src="/images/contact-ramp.jpg"
                  alt="i-Handler ground operations on the ramp"
                  width={720}
                  height={332}
                  className="w-full h-auto object-cover grayscale brightness-105 contrast-110"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* i-Handler logo in white — bottom of photo */}
                <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                  <Image
                    src="/images/I-HANDLER_APP_LOGO.png"
                    alt="i-Handler"
                    width={200}
                    height={80}
                    className="h-14 w-auto object-contain drop-shadow-2xl brightness-0 invert"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-6">How we can help you</h2>
              <ul className="space-y-4">
                {services.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#F34707] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600 text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-400 text-sm">
                  You can also reach us directly at{' '}
                  <a href="mailto:operations@i-handler.app" className="text-[#F34707] hover:text-[#d93d06] transition-colors">
                    operations@i-handler.app
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
