import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const FREE_FEATURES = [
  'Search all airports worldwide',
  'Airport operational information',
  'Runway, elevation & approaches',
  'ATC & control tower frequencies',
  'FBO & handler names and phone numbers',
  'Car rental, catering & hotel listings',
  'Service categories & fuel types',
];

const PRO_FEATURES = [
  'Everything in Free',
  'FBO & handler email addresses',
  'FBO & handler websites',
  'Airport department emails',
  'Airport department websites',
  'Car rental & catering emails/websites',
  'Hotel emails & websites',
  'Point-of-contact direct details',
  'Full payment & fuel card info',
  'Priority support',
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F34707]" />
              Simple Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Unlock the full<br />
              <span className="text-[#F34707]">i-Handler database</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Free users can search airports and see basic info. Upgrade to Pro to access
              every email, website, and direct contact across the entire directory.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">

            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Free</h2>
                <p className="text-gray-400 text-sm">Browse the directory</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-400 text-sm ml-1">forever</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/airports"
                className="block w-full py-3 rounded-xl border border-gray-200 text-center text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Start Searching
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-[#F34707] bg-white p-7 shadow-lg relative overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-5 right-5">
                <span className="px-2.5 py-1 rounded-full bg-[#F34707] text-white text-xs font-bold">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Pro</h2>
                <p className="text-gray-400 text-sm">Full directory access</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-bold text-gray-900">$290</span>
                  <span className="text-gray-400 text-sm mb-1">/ year</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">~$24/month · billed annually</p>
              </div>

              <ul className="space-y-2.5 mb-8">
                {PRO_FEATURES.map((f, i) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? 'text-gray-400 font-medium' : 'text-gray-700'}`}>
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${i === 0 ? 'text-gray-300' : 'text-[#F34707]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a href="mailto:operation@i-handler.app?subject=Pro%20Plan%20%E2%80%94%20%24290%2Fyear&body=Hi%2C%0A%0AI%27d%20like%20to%20subscribe%20to%20the%20i-Handler%20Pro%20Plan%20(%24290%2Fyear).%0A%0AName%3A%0ACompany%3A%0AEmail%3A%0A"
                className="block w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-center text-white font-bold text-sm transition-colors shadow-md">
                Get Pro Access · $290/year
              </a>
              <p className="text-center text-gray-400 text-xs mt-3">
                Reply to this email and we&apos;ll set up your account within 24 hours
              </p>
            </div>
          </div>

          {/* What stays locked callout */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 mb-10">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What does the lock mean?</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Throughout the directory you&apos;ll see fields like{' '}
              <span className="inline-flex items-center gap-1 mx-1">
                <span className="text-gray-300 blur-[3px] text-xs select-none">contact@company.com</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F34707]/10 text-[#F34707] text-[10px] font-semibold">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                  Pro
                </span>
              </span>{' '}
              — those are email addresses and websites hidden from free users.
              A Pro subscription unlocks all of them across every airport, FBO, handler,
              car rental company, caterer, and hotel in the database.
            </p>
          </div>

          {/* FAQ */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Questions</h3>
            {[
              {
                q: 'How do I get access after paying?',
                a: "Send an email using the button above. We'll create your account and send login credentials within 24 hours.",
              },
              {
                q: 'Can I pay by card?',
                a: 'We currently accept wire transfer and major credit cards. Reach out via email and we\'ll send an invoice.',
              },
              {
                q: 'Is it a recurring subscription?',
                a: 'Yes, billed annually at $290/year. We\'ll email you before renewal so you can choose to continue or cancel.',
              },
              {
                q: 'What if the data I need is missing?',
                a: 'Contact us at operation@i-handler.app. We actively maintain the database and can prioritize airports or companies you need.',
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-800 mb-1.5">{item.q}</h4>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
