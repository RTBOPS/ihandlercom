import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ManageSubscriptionPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[#F34707]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#F34707]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Manage Your Subscription</h1>
          <p className="text-gray-500 text-sm mb-8">
            To manage, renew, or cancel your Pro subscription, please contact our support team.
            We&apos;ll respond within one business day.
          </p>
          <a
            href="mailto:operations@i-handler.app?subject=Manage%20Pro%20Subscription"
            className="block w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-sm transition-colors shadow-md mb-3">
            Email Support
          </a>
          <Link href="/pricing" className="block w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
            Back to Pricing
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
