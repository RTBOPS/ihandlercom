'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── i18n ──────────────────────────────────────────────────────────────────────
const t = {
  ES: {
    badge: 'i-Handler BHS',
    hero1: 'Control total de equipaje',
    hero2: 'en tiempo real',
    heroSub: 'Escanea, rastrea y reporta cada maleta desde el check-in hasta la aeronave. Cumple con IATA 753 y los más altos estándares de seguridad de la aviación mundial.',
    ctaFree: 'Prueba 10 vuelos gratis',
    trialNote: 'Sin tarjeta de crédito · Crea tu empresa · 10 vuelos de prueba incluidos',
    statsB: 'Maletas procesadas',
    statsF: 'Vuelos controlados',
    statsA: 'Aerolíneas compatibles',
    statsC: 'Cumplimiento IATA 753',
    statsNote: 'Solución probada en operaciones reales de handling y rampa · Compatible iOS y Android',
    featTitle: 'Todo lo que necesita un handler moderno',
    featSub: 'Cada función fue diseñada para resolver los problemas reales de la operación de equipaje y cumplir con los estándares exigidos por la industria.',
    features: [
      { tag: 'Trazabilidad completa',    title: 'Escaneo en cada punto',           desc: 'Código de barras IATA en check-in, carga, transferencia y entrega. Cada evento queda registrado con timestamp y agente.' },
      { tag: 'IATA 753',                 title: 'Cumplimiento garantizado',        desc: 'Los 4 puntos de control obligatorios según resolución IATA 753. Auditoría lista para cualquier inspección internacional.' },
      { tag: 'Operación en tiempo real', title: 'Live Board de vuelo',             desc: 'Vista en vivo del estado de cada maleta por vuelo. Identifica faltantes antes del cierre de puerta.' },
      { tag: 'Bingo Charts',             title: 'Bingo Charts automáticos',        desc: 'Generación automática de bingo charts por vuelo. Visualiza el conteo de maletas cargadas vs. esperadas en tiempo real.' },
      { tag: 'Reportes impresos',        title: 'Impresión de reportes',           desc: 'Genera e imprime reportes detallados de operación por vuelo, turno y agente. Listos para entrega a la aerolínea o a supervisión.' },
      { tag: 'Exportación XML',          title: 'Reporte XML a aerolíneas',        desc: 'Envía el reporte de equipajes en formato XML directamente a las aerolíneas que lo requieran. Integración sin fricción con los sistemas de las líneas aéreas.' },
      { tag: 'Planificación',            title: 'Calendario de vuelos',            desc: 'Programa y administra todos los vuelos del día. Asigna agentes y equipos desde una sola pantalla.' },
      { tag: 'Estadísticas avanzadas',   title: 'Performance por vuelo',           desc: 'Reportes de performance por vuelo, agente y turno. Exportable para auditoría y análisis operacional.' },
      { tag: 'Multi-aerolínea',          title: 'Compatible con cualquier carrier', desc: 'Funciona con los formatos de etiqueta de todas las principales aerolíneas. Sin configuración adicional.' },
    ],
    screensTitle: 'La app en acción',
    screensSub: 'Interfaz diseñada para agentes de rampa — rápida, clara y sin errores.',
    screensLabels: ['Inicio', 'Login', 'Calendario', 'Vuelo a escanear', 'Check-in', 'Live Board', 'Reportes'],
    trustTitle: 'Construido sobre estándares IATA',
    trustSub: 'i-Handler BHS implementa la resolución IATA 753 que exige el rastreo de equipaje en los 4 puntos clave del proceso. Diseñado para aerolíneas que exigen el más alto nivel de cumplimiento operacional.',
    trustPoints: [
      'Punto 1 — Entrega del pasajero en check-in',
      'Punto 2 — Carga a la aeronave',
      'Punto 3 — Transferencia entre vuelos',
      'Punto 4 — Entrega al pasajero en destino',
    ],
    bagTitle: 'Cualquier tipo de equipaje, bajo control',
    bagSub: 'Maletas, bultos especiales, artículos deportivos, equipos frágiles — todo clasificado, escaneado y rastreado.',
    downloadTitle: '¿Listo para comenzar?',
    downloadSub: 'Descarga i-Handler BHS, crea tu empresa y empieza con 10 vuelos de prueba completamente gratis. Sin contratos, sin compromisos.',
    downloadNote: 'Descarga gratis · 10 vuelos de prueba · iOS y Android',
  },
  EN: {
    badge: 'i-Handler BHS',
    hero1: 'Full baggage control',
    hero2: 'in real time',
    heroSub: 'Scan, track and report every bag from check-in to aircraft. Compliant with IATA 753 and the highest safety standards of the global aviation industry.',
    ctaFree: 'Try 10 flights free',
    trialNote: 'No credit card · Create your company · 10 trial flights included',
    statsB: 'Bags processed',
    statsF: 'Flights controlled',
    statsA: 'Compatible airlines',
    statsC: 'IATA 753 compliance',
    statsNote: 'Proven solution in real handling and ramp operations · iOS and Android compatible',
    featTitle: 'Everything a modern handler needs',
    featSub: 'Every feature was designed to solve real baggage handling problems and meet the standards demanded by the aviation industry.',
    features: [
      { tag: 'Full traceability',     title: 'Scan at every checkpoint',         desc: 'IATA barcodes at check-in, loading, transfer and delivery. Every event is recorded with timestamp and agent.' },
      { tag: 'IATA 753',              title: 'Guaranteed compliance',            desc: 'All 4 mandatory checkpoints per IATA Resolution 753. Audit-ready for any international inspection.' },
      { tag: 'Real-time operations',  title: 'Flight Live Board',                desc: 'Live status of every bag per flight. Identify missing bags before gate closes.' },
      { tag: 'Bingo Charts',          title: 'Automatic Bingo Charts',           desc: 'Automatic bingo chart generation per flight. Visualize loaded vs. expected bag counts in real time.' },
      { tag: 'Printed reports',       title: 'Report printing',                  desc: 'Generate and print detailed operation reports by flight, shift and agent. Ready to hand over to the airline or supervision.' },
      { tag: 'XML Export',            title: 'XML baggage report to airlines',   desc: 'Send the baggage report in XML format directly to airlines that require it. Friction-free integration with airline systems.' },
      { tag: 'Planning',              title: 'Flight calendar',                  desc: 'Schedule and manage all flights of the day. Assign agents and equipment from a single screen.' },
      { tag: 'Advanced statistics',   title: 'Per-flight performance',           desc: 'Performance reports by flight, agent and shift. Exportable for audit and operational analysis.' },
      { tag: 'Multi-airline',         title: 'Compatible with any carrier',      desc: 'Works with label formats from all major airlines. No additional configuration required.' },
    ],
    screensTitle: 'The app in action',
    screensSub: 'Interface designed for ramp agents — fast, clear and error-free.',
    screensLabels: ['Home', 'Login', 'Calendar', 'Flight to scan', 'Check-in', 'Live Board', 'Reports'],
    trustTitle: 'Built on IATA standards',
    trustSub: 'i-Handler BHS implements IATA Resolution 753, which requires baggage tracking at 4 key process points. Designed for airlines that demand the highest level of operational compliance.',
    trustPoints: [
      'Point 1 — Passenger delivery at check-in',
      'Point 2 — Loading onto the aircraft',
      'Point 3 — Transfer between flights',
      'Point 4 — Delivery to passenger at destination',
    ],
    bagTitle: 'Any type of baggage, under control',
    bagSub: 'Suitcases, special items, sports equipment, fragile goods — all classified, scanned and tracked.',
    downloadTitle: 'Ready to get started?',
    downloadSub: 'Download i-Handler BHS, create your company and start with 10 completely free trial flights. No contracts, no commitments.',
    downloadNote: 'Free download · 10 trial flights · iOS & Android',
  },
  PT: {
    badge: 'i-Handler BHS',
    hero1: 'Controle total de bagagem',
    hero2: 'em tempo real',
    heroSub: 'Escaneie, rastreie e reporte cada mala do check-in até a aeronave. Em conformidade com a IATA 753 e os mais altos padrões de segurança da aviação mundial.',
    ctaFree: 'Teste 10 voos grátis',
    trialNote: 'Sem cartão de crédito · Crie sua empresa · 10 voos de teste incluídos',
    statsB: 'Malas processadas',
    statsF: 'Voos controlados',
    statsA: 'Companhias compatíveis',
    statsC: 'Conformidade IATA 753',
    statsNote: 'Solução testada em operações reais de handling e pista · Compatível iOS e Android',
    featTitle: 'Tudo que um handler moderno precisa',
    featSub: 'Cada recurso foi projetado para resolver os problemas reais de bagagem e atender aos padrões exigidos pela indústria.',
    features: [
      { tag: 'Rastreabilidade total',   title: 'Escaneamento em cada ponto',       desc: 'Código de barras IATA no check-in, embarque, transferência e entrega. Cada evento registrado com timestamp e agente.' },
      { tag: 'IATA 753',                title: 'Conformidade garantida',           desc: 'Os 4 pontos de controle obrigatórios da resolução IATA 753. Auditoria pronta para qualquer inspeção internacional.' },
      { tag: 'Operação em tempo real',  title: 'Live Board de voo',                desc: 'Visualização ao vivo do status de cada mala por voo. Identifique faltantes antes do fechamento do portão.' },
      { tag: 'Bingo Charts',            title: 'Bingo Charts automáticos',         desc: 'Geração automática de bingo charts por voo. Visualize contagem de malas embarcadas vs. esperadas em tempo real.' },
      { tag: 'Relatórios impressos',    title: 'Impressão de relatórios',          desc: 'Gere e imprima relatórios detalhados de operação por voo, turno e agente. Prontos para entrega à companhia ou supervisão.' },
      { tag: 'Exportação XML',          title: 'Relatório XML para companhias',    desc: 'Envie o relatório de bagagens em formato XML diretamente às companhias que o exigirem. Integração sem atrito com os sistemas das aéreas.' },
      { tag: 'Planejamento',            title: 'Calendário de voos',               desc: 'Programe e gerencie todos os voos do dia. Atribua agentes e equipes em uma única tela.' },
      { tag: 'Estatísticas avançadas',  title: 'Performance por voo',              desc: 'Relatórios de desempenho por voo, agente e turno. Exportável para auditoria e análise operacional.' },
      { tag: 'Multi-companhia',         title: 'Compatível com qualquer carrier',  desc: 'Funciona com os formatos de etiqueta de todas as principais companhias. Sem configuração adicional.' },
    ],
    screensTitle: 'O app em ação',
    screensSub: 'Interface projetada para agentes de pista — rápida, clara e sem erros.',
    screensLabels: ['Início', 'Login', 'Calendário', 'Voo para escanear', 'Check-in', 'Live Board', 'Relatórios'],
    trustTitle: 'Construído sobre padrões IATA',
    trustSub: 'i-Handler BHS implementa a resolução IATA 753, que exige o rastreamento de bagagem nos 4 pontos-chave do processo. Projetado para companhias que exigem o mais alto nível de conformidade operacional.',
    trustPoints: [
      'Ponto 1 — Entrega do passageiro no check-in',
      'Ponto 2 — Embarque na aeronave',
      'Ponto 3 — Transferência entre voos',
      'Ponto 4 — Entrega ao passageiro no destino',
    ],
    bagTitle: 'Qualquer tipo de bagagem, sob controle',
    bagSub: 'Malas, volumes especiais, equipamentos esportivos, itens frágeis — tudo classificado, escaneado e rastreado.',
    downloadTitle: 'Pronto para começar?',
    downloadSub: 'Baixe o i-Handler BHS, crie sua empresa e comece com 10 voos de teste completamente gratuitos. Sem contratos, sem compromissos.',
    downloadNote: 'Download gratuito · 10 voos de teste · iOS e Android',
  },
} as const;

type Lang = keyof typeof t;

const screenshots = [
  '01-landing', '02-login', '03-calendar',
  '04-flight-to-scan', '05-checkin', '06-liveboard', '07-reports',
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BHSPage() {
  const [lang, setLang] = useState<Lang>('EN');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const txt = t[lang];

  const langFlags: Record<Lang, string> = { ES: '🇪🇸', EN: '🇺🇸', PT: '🇧🇷' };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-0 min-h-[85vh] flex items-center">
          {/* Background photo */}
          <div className="absolute inset-0">
            <Image src="/images/bhs/top.jpg" alt="BHS operations" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-black/70" />
          </div>

          {/* Language switcher — top right */}
          <div className="absolute top-20 right-4 md:right-8 z-20 flex gap-1 bg-black/40 backdrop-blur-sm rounded-xl p-1">
            {(['ES', 'EN', 'PT'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === l ? 'bg-[#F34707] text-white shadow' : 'text-white/60 hover:text-white'}`}>
                <span>{langFlags[l]}</span><span>{l}</span>
              </button>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center py-16">
            {/* Left — copy */}
            <div>
              {/* BHS Logo */}
              <div className="mb-5">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-2 border-white/10">
                  <Image src="/images/bhs/bhs-logo.jpg" alt="i-Handler BHS" width={80} height={80} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FC8C00] animate-pulse" />
                {txt.badge}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
                {txt.hero1}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">{txt.hero2}</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">{txt.heroSub}</p>

              <div className="flex flex-col gap-2">
                <p className="text-xs text-[#FC8C00] font-semibold uppercase tracking-wider">{txt.trialNote}</p>
              </div>

              {/* App Store buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                <a href="https://apps.apple.com/us/app/i-handler-bhs/id6782959303" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-left">
                    <div className="text-[10px] text-white/60 leading-none">Download on the</div>
                    <div className="text-sm font-semibold leading-tight">App Store</div>
                  </div>
                </a>
                <a href="#" className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.98.06l13.07-7.53-2.75-2.75-11.3 10.22zM.44 1.06C.17 1.4 0 1.88 0 2.53v18.94c0 .65.17 1.12.44 1.47l.08.07 10.6-10.6v-.25L.52.99l-.08.07zM20.13 10.3l-2.85-1.64-3.08 3.08 3.08 3.08 2.87-1.66c.82-.47.82-1.24-.02-1.86zM3.18.24L16.25 7.77l-2.75 2.75L2.2.3c.32-.14.68-.12.98-.06z"/></svg>
                  <div className="text-left">
                    <div className="text-[10px] text-white/60 leading-none">Get it on</div>
                    <div className="text-sm font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right — iPhone mockup with 05-checkin */}
            <div className="flex justify-center items-end pb-0">
              <div className="relative">
                <div className="relative w-56 md:w-64 rounded-[3rem] overflow-hidden border-[6px] border-white/20 shadow-2xl shadow-black/60 bg-black">
                  <Image src="/images/bhs/screenshots/05-checkin.png" alt="BHS Check-in" width={256} height={554} className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-[#F34707]/30 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-200 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { num: '500K+', label: txt.statsB },
                { num: '12K+',  label: txt.statsF },
                { num: '40+',   label: txt.statsA },
                { num: '100%',  label: txt.statsC },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold text-[#F34707] mb-1">{s.num}</div>
                  <div className="text-xs text-gray-500 font-medium leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">{txt.statsNote}</p>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{txt.featTitle}</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">{txt.featSub}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {txt.features.map((f, i) => {
                const iconPaths = [
                  '/images/bhs/icon-barcode.svg',
                  '/images/bhs/icon-scanner.svg',
                  '/images/bhs/icon-flow.svg',
                  null, // bingo — inline SVG
                  null, // reports — inline SVG
                  null, // XML — inline SVG
                  '/images/bhs/icon-calendar.svg',
                  '/images/bhs/icon-barcode.svg',
                  '/images/bhs/icon-scanner.svg',
                ];
                const inlineIcons: (JSX.Element | null)[] = [
                  null, null, null,
                  // Bingo chart icon
                  <svg key="bingo" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="10" y="3" width="5" height="5" rx="1"/><rect x="17" y="3" width="4" height="5" rx="1"/><rect x="3" y="10" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1" className="fill-current opacity-30"/><rect x="17" y="10" width="4" height="5" rx="1"/><rect x="3" y="17" width="5" height="4" rx="1"/><rect x="10" y="17" width="5" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1" className="fill-current opacity-30"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 8l2 2 4-4"/></svg>,
                  // Print/report icon
                  <svg key="print" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z"/></svg>,
                  // XML/code icon
                  <svg key="xml" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 15l-2 2 2 2M15 15l2 2-2 2M12 13l-1 4"/></svg>,
                  null, null, null,
                ];
                const isHero = i === 0;
                return (
                  <div key={i} className={`rounded-2xl p-6 border flex gap-4 ${isHero ? 'bg-gradient-to-br from-[#F34707] to-[#FC8C00] border-transparent sm:col-span-2 lg:col-span-1' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow ${isHero ? 'bg-white/20 text-white' : 'bg-white border border-gray-200 text-[#F34707]'}`}>
                      {inlineIcons[i] ?? (
                        <Image src={iconPaths[i]!} alt={f.title} width={32} height={32} className="w-8 h-8 object-contain" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isHero ? 'text-white/70' : 'text-[#F34707]'}`}>{f.tag}</div>
                      <h3 className={`text-base font-bold mb-1 ${isHero ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                      <p className={`text-sm leading-relaxed ${isHero ? 'text-white/85' : 'text-gray-500'}`}>{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── IATA TRUST SECTION ──────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-950">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FC8C00]" />
                IATA Resolution 753
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{txt.trustTitle}</h2>
              <p className="text-gray-400 text-sm mb-8">{txt.trustSub}</p>
              <ul className="space-y-3">
                {txt.trustPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00c758] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* IATA Seal */}
            <div className="flex justify-center">
              <Image src="/images/bhs/iata-seal.png" alt="IATA Certified" width={420} height={420} className="w-full max-w-sm h-auto object-contain drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* ── SCREENSHOTS ─────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-900 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{txt.screensTitle}</h2>
            <p className="text-gray-400 text-sm">{txt.screensSub}</p>
          </div>
          <div className="flex gap-5 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
            {screenshots.map((s, i) => (
              <div key={i} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                <button
                  onClick={() => setLightbox(`/images/bhs/screenshots/${s}.png`)}
                  className="w-36 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in"
                >
                  <Image src={`/images/bhs/screenshots/${s}.png`} alt={txt.screensLabels[i]} width={144} height={310} className="w-full h-auto object-cover" />
                </button>
                <span className="text-gray-500 text-xs">{txt.screensLabels[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── IPAD SCREENSHOTS ────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-950 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-4 uppercase tracking-wider">
              iPad
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{txt.screensTitle}</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
            {screenshots.map((s, i) => (
              <div key={i} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                <button
                  onClick={() => setLightbox(`/images/bhs/screenshots-ipad/${s}.png`)}
                  className="w-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in"
                >
                  <Image src={`/images/bhs/screenshots-ipad/${s}.png`} alt={txt.screensLabels[i]} width={256} height={192} className="w-full h-auto object-cover" />
                </button>
                <span className="text-gray-500 text-xs">{txt.screensLabels[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── BAGS SECTION ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 px-4">
          <div className="absolute inset-0">
            <Image src="/images/bhs/bags.jpg" alt="Baggage handling" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{txt.bagTitle}</h2>
            <p className="text-gray-300 text-lg">{txt.bagSub}</p>
          </div>
        </section>

        {/* ── DOWNLOAD CTA ────────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden mx-auto mb-6 shadow-xl">
              <Image src="/images/bhs/bhs-logo.jpg" alt="BHS" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{txt.downloadTitle}</h2>
            <p className="text-gray-500 mb-8 text-lg max-w-xl mx-auto">{txt.downloadSub}</p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a href="https://apps.apple.com/us/app/i-handler-bhs/id6782959303" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-base transition-colors shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div className="text-left">
                  <div className="text-[10px] text-white/60 leading-none">Download on the</div>
                  <div className="text-base font-bold leading-tight">App Store</div>
                </div>
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-base transition-colors shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.98.06l13.07-7.53-2.75-2.75-11.3 10.22zM.44 1.06C.17 1.4 0 1.88 0 2.53v18.94c0 .65.17 1.12.44 1.47l.08.07 10.6-10.6v-.25L.52.99l-.08.07zM20.13 10.3l-2.85-1.64-3.08 3.08 3.08 3.08 2.87-1.66c.82-.47.82-1.24-.02-1.86zM3.18.24L16.25 7.77l-2.75 2.75L2.2.3c.32-.14.68-.12.98-.06z"/></svg>
                <div className="text-left">
                  <div className="text-[10px] text-white/60 leading-none">Get it on</div>
                  <div className="text-base font-bold leading-tight">Google Play</div>
                </div>
              </a>
            </div>
            <p className="text-xs text-gray-400 font-medium">{txt.downloadNote}</p>
          </div>
        </section>

        {/* ── LIGHTBOX ────────────────────────────────────────────────────── */}
        {lightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}>
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <Image src={lightbox} alt="Screenshot" width={800} height={1600}
                className="max-h-[85vh] w-auto h-auto object-contain rounded-3xl shadow-2xl" />
              <button onClick={() => setLightbox(null)}
                className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
