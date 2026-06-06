'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type CompanyType = 'fbo' | 'handler' | '';

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [companyType, setCompanyType] = useState<CompanyType>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [icao, setIcao] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!companyType) {
      setError('Please select your company type.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        companyName,
        companyType,
        icao: icao.toUpperCase(),
        role: 'owner',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      router.push('/portal');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 8 characters.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Company Type */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Company Type</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'handler', label: '✈️ Ground Handler', desc: 'Ramp, fuel, passenger handling' },
            { value: 'fbo', label: '🏢 FBO', desc: 'Fixed Base Operator' },
          ] as { value: CompanyType; label: string; desc: string }[]).map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setCompanyType(t.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                companyType === t.value
                  ? 'border-[#F34707] bg-[#F34707]/10 text-white'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'
              }`}
            >
              <div className="font-medium text-sm mb-0.5">{t.label}</div>
              <div className="text-xs opacity-60">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Company Name</label>
        <input
          type="text"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your FBO or Handler name"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
        />
      </div>

      {/* ICAO */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Airport ICAO Code</label>
        <input
          type="text"
          required
          value={icao}
          onChange={(e) => setIcao(e.target.value.toUpperCase())}
          placeholder="e.g. KJFK"
          maxLength={4}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm font-mono uppercase"
        />
        <p className="mt-1 text-xs text-white/30">The airport where your company operates</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Work Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
        />
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-xs text-white/30 text-center">
        After registering your account will be reviewed before your listing goes live.
      </p>
    </form>
  );
}
