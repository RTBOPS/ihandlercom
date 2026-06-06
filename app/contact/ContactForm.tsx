'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('i-Handler Inquiry');
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:operation@i-handler.app?subject=${subject}&body=${body}`;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#F34707]/30 bg-[#F34707]/10 p-8 text-center">
        <div className="text-4xl mb-3">✈️</div>
        <h3 className="text-white font-semibold text-lg mb-2">Message ready!</h3>
        <p className="text-white/50 text-sm">Your email client should have opened. If not, email us directly at{' '}
          <a href="mailto:operation@i-handler.app" className="text-[#F34707]">operation@i-handler.app</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Work Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1.5">Message</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="How can we help you?"
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus:border-[#F34707] transition-colors text-sm resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-sm transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
