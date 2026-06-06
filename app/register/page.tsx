import Navbar from '@/components/Navbar';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Register Your Company</h1>
            <p className="text-white/50 text-sm">
              FBO and Handler owners — create an account to manage your listing in the i-Handler directory
            </p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <a href="/login" className="text-[#F34707] hover:text-[#FC8C00] transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
