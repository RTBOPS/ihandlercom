import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SubscribeCancelPage() {
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

          {/* Cancel icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-gray-300 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment cancelled
          </h1>
          <p className="text-gray-500 text-lg mb-2">
            No charge was made to your card.
          </p>
          <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto">
            You can try again whenever you&apos;re ready. If you had trouble with the
            checkout, contact us and we can help directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing"
              className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-sm transition-colors shadow-md">
              Try Again
            </Link>
            <a href="mailto:operations@i-handler.app?subject=Pro%20Plan%20Checkout%20Help"
              className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
