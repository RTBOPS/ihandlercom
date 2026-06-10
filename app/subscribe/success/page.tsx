import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SubscribeSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
        <div className="max-w-lg w-full text-center">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/I-HANDLER_APP_LOGO.png"
              alt="i-Handler"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          </div>

          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-400 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to i-Handler Pro!
          </h1>
          <p className="text-gray-500 text-lg mb-2">
            Your subscription is now active.
          </p>
          <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto">
            You&apos;ll receive a confirmation email shortly. Your Pro access grants you
            full contact details — emails, websites, and direct contacts — across the
            entire i-Handler directory.
          </p>

          {/* What's next */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left mb-8 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">What&apos;s next</h2>
            {[
              { icon: '✈️', title: 'Search any airport', desc: 'Full contact info is now unlocked across 10,000+ airports.' },
              { icon: '📧', title: 'Check your email', desc: 'Your receipt and login credentials will arrive within minutes.' },
              { icon: '📱', title: 'Download the app', desc: 'Manage everything on the go with the i-Handler mobile app.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 items-start">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/airports"
              className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-sm transition-colors shadow-md">
              Search Airports Now
            </Link>
            <a href="https://i-handler.app" target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors">
              Open i-Handler App →
            </a>
          </div>

          <p className="mt-8 text-gray-400 text-xs">
            Need help? Contact us at{' '}
            <a href="mailto:operations@i-handler.app" className="text-[#F34707]">
              operations@i-handler.app
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
