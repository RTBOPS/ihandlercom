import Link from 'next/link';

/**
 * LockedField – shows a blurred placeholder with a lock badge and upgrade CTA.
 * Use wherever email or website should be hidden from free users.
 */
export default function LockedField({ type = 'email', inline = false }: {
  type?: 'email' | 'website';
  inline?: boolean;
}) {
  const placeholder = type === 'email' ? 'contact@••••••.com' : 'www.••••••.com';
  const icon = type === 'email' ? '✉' : '🌐';

  if (inline) {
    // Compact version for table cells
    return (
      <Link href="/pricing"
        className="inline-flex items-center gap-1.5 group"
        title="Unlock with Pro Plan · $290/year">
        <span className="text-xs text-gray-300 blur-[3px] select-none pointer-events-none">{placeholder}</span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F34707]/10 text-[#F34707] text-[10px] font-semibold group-hover:bg-[#F34707] group-hover:text-white transition-colors whitespace-nowrap">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          Pro
        </span>
      </Link>
    );
  }

  // Full version for cards
  return (
    <Link href="/pricing"
      className="flex items-center gap-2 group py-0.5"
      title="Unlock with Pro Plan · $290/year">
      <span className="text-gray-400 text-sm">{icon}</span>
      <span className="text-sm text-gray-300 blur-[4px] select-none pointer-events-none flex-1">{placeholder}</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F34707]/10 text-[#F34707] text-xs font-semibold group-hover:bg-[#F34707] group-hover:text-white transition-colors whitespace-nowrap flex-shrink-0">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
        </svg>
        Unlock · Pro
      </span>
    </Link>
  );
}
