import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function CustomersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Our Customers</h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mx-auto">
              Over the years, i-Handler has supported a wide range of business aviation operators,
              charter companies, and flight departments. The logos below represent some of the
              organizations that have relied on our team for seamless handling and flight support.
            </p>
          </div>

          {/* Client logos */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 flex items-center justify-center shadow-sm">
            <Image
              src="/images/Marshaller.png"
              alt="i-Handler clients"
              width={800}
              height={400}
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* CTA */}
          <div className="mt-16 text-center rounded-2xl border border-[#F34707]/20 bg-[#F34707]/5 p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Join our network</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Are you an FBO or ground handler? Get listed in our worldwide directory and connect
              with aviation operators globally.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/register"
                className="px-6 py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors"
              >
                Register Your Company
              </a>
              <a
                href="/contact"
                className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors border border-gray-300"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
