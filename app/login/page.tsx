import Navbar from '@/components/Navbar';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Login</h1>
            <p className="text-gray-500 text-sm">
              Sign in to manage your FBO or Handler listing
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-[#F34707] hover:text-[#d93d06] transition-colors">
              Register your company
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
