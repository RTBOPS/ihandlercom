import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
          <p className="text-gray-500 mb-2">
            Welcome to <span className="font-semibold text-[#F34707]">i-Handler Pro</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your annual subscription is now active. You have full access to the i-Handler database —
            emails, websites, and direct contacts across every airport, FBO, and handler in our directory.
          </p>
          <div className="space-y-3">
            <Link
              href="/airports"
              className="block w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-sm transition-colors shadow-md">
              Start Searching the Database →
            </Link>
            <Link
              href="/"
              className="block w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
              Back to Home
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            A confirmation has been sent to your PayPal email. Questions? Contact{' '}
            <a href="mailto:operations@i-handler.app" className="text-[#F34707] hover:underline">
              operations@i-handler.app
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
