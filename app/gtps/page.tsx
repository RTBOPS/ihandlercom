'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── i18n ──────────────────────────────────────────────────────────────────────
const t = {
  ES: {
    badge: 'i-Handler GTPS',
    hero1: 'Tiempos de turnaround',
    hero2: 'bajo control total',
    heroSub: 'Captura, mide y reporta cada fase de la operación en tierra. Compara contra objetivos IATA · IGOM / AHM y entrega reportes a las aerolíneas con un solo toque.',
    trialNote: 'Sin tarjeta de crédito · Crea tu empresa · Primeros vuelos de prueba incluidos',
    statsF: 'Vuelos registrados',
    statsH: 'Handlers y FBOs',
    statsA: 'Aerolíneas en catálogo',
    statsC: 'Conformidad IGOM/AHM',
    statsNote: 'Solución diseñada para operadores reales de rampa · Compatible iOS y Android',
    featTitle: 'Control total del turnaround',
    featSub: 'Cada función fue diseñada para cumplir con los estándares que exigen las aerolíneas y las autoridades de aviación.',
    features: [
      { tag: 'Captura con un toque',      title: 'Tiempos por fase',                desc: 'Toca "Ahora" para registrar llegada, descarga, carga, limpieza, combustible, catering, embarque, pushback y salida. Preciso y sin papel.' },
      { tag: 'Estándares IATA · IGOM',    title: 'Turnaround vs objetivo',          desc: 'La app calcula automáticamente el turnaround y lo compara contra el objetivo IATA según la categoría del avión (narrow / wide body) con semáforo a tiempo / tarde.' },
      { tag: 'Operación en vivo',         title: 'Live Board de vuelos',            desc: 'Tablero en vivo con el estado de todos los vuelos abiertos. Identifica en segundos qué vuelo está en riesgo antes del cierre de puerta.' },
      { tag: 'Diagrama turnaround',       title: 'Gráfico de subprocesos',          desc: 'Visualiza la duración de cada subproceso del turnaround en un diagrama tipo Gantt. Identifica cuellos de botella operacionales al instante.' },
      { tag: 'PDF por vuelo',             title: 'Reporte de vuelo imprimible',     desc: 'Genera e imprime el reporte completo por vuelo con logo de la aerolínea, tiempos de cada fase, GSE utilizado, personal, conteos de PAX/equipaje y firmas de ambos supervisores.' },
      { tag: 'KPIs para aerolíneas',      title: 'Reportes aggregados mensuales',   desc: 'Entrega a cada aerolínea sus estadísticas de OTP, demoras con código IATA, cancelaciones y tiempos promedio. Listos para exportar y presentar a la línea aérea.' },
      { tag: 'Calendario de operaciones', title: 'Vista mes / semana / día',        desc: 'Programa y gestiona todos los vuelos del día. Vista mensual, semanal y diaria. Cada vuelo asignado con aerolínea, hora y agentes.' },
      { tag: 'Control de personal',       title: 'Roles y alta por QR',             desc: 'Roles diferenciados para jefe, supervisor y agentes de rampa. Alta de personal mediante QR o email. Control total de quién opera cada vuelo.' },
      { tag: 'Catálogo de aerolíneas',    title: 'Logos oficiales integrados',      desc: 'Catálogo completo con logos oficiales de las principales aerolíneas. Reportes profesionales y consistentes sin configuración adicional.' },
    ],
    screensTitle: 'La app en acción',
    screensSub: 'Interfaz diseñada para la operación real de rampa — rápida, precisa y sin papel.',
    screensLabels: ['Calendario', 'Vuelos', 'Reporte aerolínea', 'Live Board', 'Turnaround', 'Login', 'Vista semana', 'Conteos', 'Cierre / firmas', 'Reportes'],
    iataTitle: 'Construido sobre estándares IATA · IGOM / AHM',
    iataSub: 'i-Handler GTPS implementa los benchmarks de tiempo de IATA IGOM (Irregular Operations Manual) y AHM (Airport Handling Manual) para que tu operación sea comparable y auditable internacionalmente.',
    iataPoints: [
      'Objetivos de turnaround por categoría de aeronave (narrow / wide body)',
      'Codificación de demoras con código IATA estándar',
      'Registro de todos los subprocesos del turnaround',
      'Reportes KPI listos para auditoría de la aerolínea',
      'Firmas digitales de ambos supervisores en cada reporte',
      'Multi-idioma: Español · English · Português · Français · عربي',
    ],
    bagTitle: 'Para handlers, FBOs y aerolíneas',
    bagSub: 'Desde el handler regional hasta la aerolínea que exige datos precisos de turnaround — i-Handler GTPS es la herramienta que conecta ambos mundos con datos reales y reportes profesionales.',
    downloadTitle: '¿Listo para comenzar?',
    downloadSub: 'Descarga i-Handler GTPS, crea tu empresa y comienza a registrar tus primeros vuelos de prueba completamente gratis. Sin contratos, sin compromisos.',
    downloadNote: 'Descarga gratis · Vuelos de prueba incluidos · iOS y Android',
  },
  EN: {
    badge: 'i-Handler GTPS',
    hero1: 'Ground turnaround times',
    hero2: 'fully under control',
    heroSub: 'Capture, measure and report every ground phase. Compare against IATA · IGOM / AHM targets and deliver airline reports with a single tap.',
    trialNote: 'No credit card · Create your company · First trial flights included',
    statsF: 'Flights recorded',
    statsH: 'Handlers & FBOs',
    statsA: 'Airlines in catalog',
    statsC: 'IGOM/AHM compliance',
    statsNote: 'Built for real ramp operators · iOS and Android compatible',
    featTitle: 'Total turnaround control',
    featSub: 'Every feature was designed to meet the standards demanded by airlines and aviation authorities.',
    features: [
      { tag: 'One-tap capture',           title: 'Time capture by phase',           desc: 'Tap "Now" to record arrival, unload, load, cleaning, fueling, catering, boarding, pushback and departure. Accurate and paperless.' },
      { tag: 'IATA · IGOM standards',     title: 'Turnaround vs target',            desc: 'The app automatically calculates the turnaround and compares it against the IATA target for the aircraft category (narrow / wide body) with an on-time / late color code.' },
      { tag: 'Live operations',           title: 'Flight Live Board',               desc: 'Live board with the status of all open flights. Instantly see which flight is at risk before gate close.' },
      { tag: 'Turnaround diagram',        title: 'Subprocess chart',                desc: 'Visualize the duration of each turnaround subprocess in a Gantt-style diagram. Identify operational bottlenecks instantly.' },
      { tag: 'PDF per flight',            title: 'Printable flight report',         desc: 'Generate and print the full per-flight report with airline logo, phase times, GSE used, staff, PAX/baggage counts and dual supervisor signatures.' },
      { tag: 'KPIs for airlines',         title: 'Aggregated monthly reports',      desc: 'Deliver to each airline their OTP statistics, delays by IATA code, cancellations and average times. Ready to export and present to the airline.' },
      { tag: 'Operations calendar',       title: 'Month / week / day view',         desc: 'Schedule and manage all flights of the day. Monthly, weekly and daily views. Each flight assigned with airline, time and agents.' },
      { tag: 'Staff control',             title: 'Roles & QR onboarding',           desc: 'Differentiated roles for boss, supervisor and ramp agents. Staff onboarding via QR or email. Full control of who operates each flight.' },
      { tag: 'Airline catalog',           title: 'Official logos built in',         desc: 'Complete catalog with official logos of all major airlines. Professional, consistent reports with no additional configuration.' },
    ],
    screensTitle: 'The app in action',
    screensSub: 'Interface built for real ramp operations — fast, accurate and paperless.',
    screensLabels: ['Calendar', 'Flights', 'Airline report', 'Live Board', 'Turnaround', 'Login', 'Week view', 'Counts', 'Sign-off', 'Reports'],
    iataTitle: 'Built on IATA · IGOM / AHM standards',
    iataSub: 'i-Handler GTPS implements IATA IGOM (Ground Operations Manual) and AHM (Airport Handling Manual) time benchmarks so your operation is internationally comparable and audit-ready.',
    iataPoints: [
      'Turnaround targets by aircraft category (narrow / wide body)',
      'Delay coding with standard IATA delay codes',
      'Full turnaround subprocess recording',
      'KPI reports ready for airline audit',
      'Dual supervisor digital signatures on every report',
      'Multi-language: English · Español · Português · Français · عربي',
    ],
    bagTitle: 'For handlers, FBOs and airlines',
    bagSub: 'From the regional handler to the airline demanding precise turnaround data — i-Handler GTPS connects both worlds with real data and professional reports.',
    downloadTitle: 'Ready to get started?',
    downloadSub: 'Download i-Handler GTPS, create your company and start logging your first trial flights completely free. No contracts, no commitments.',
    downloadNote: 'Free download · Trial flights included · iOS & Android',
  },
  PT: {
    badge: 'i-Handler GTPS',
    hero1: 'Tempos de turnaround',
    hero2: 'totalmente sob controle',
    heroSub: 'Capture, meça e reporte cada fase da operação em terra. Compare com metas IATA · IGOM / AHM e entregue relatórios às companhias com um único toque.',
    trialNote: 'Sem cartão de crédito · Crie sua empresa · Primeiros voos de teste incluídos',
    statsF: 'Voos registrados',
    statsH: 'Handlers e FBOs',
    statsA: 'Companhias no catálogo',
    statsC: 'Conformidade IGOM/AHM',
    statsNote: 'Solução criada para operadores reais de pista · Compatível iOS e Android',
    featTitle: 'Controle total do turnaround',
    featSub: 'Cada recurso foi projetado para atender os padrões exigidos pelas companhias e autoridades de aviação.',
    features: [
      { tag: 'Captura em um toque',       title: 'Tempos por fase',                 desc: 'Toque "Agora" para registrar chegada, descarga, carga, limpeza, combustível, catering, embarque, pushback e partida. Preciso e sem papel.' },
      { tag: 'Padrões IATA · IGOM',       title: 'Turnaround vs meta',              desc: 'O app calcula automaticamente o turnaround e compara com a meta IATA para a categoria da aeronave (narrow / wide body) com semáforo no prazo / atrasado.' },
      { tag: 'Operação ao vivo',          title: 'Live Board de voos',              desc: 'Painel ao vivo com o status de todos os voos abertos. Veja em segundos qual voo está em risco antes do fechamento do portão.' },
      { tag: 'Diagrama turnaround',       title: 'Gráfico de subprocessos',         desc: 'Visualize a duração de cada subprocesso do turnaround em um diagrama tipo Gantt. Identifique gargalos operacionais instantaneamente.' },
      { tag: 'PDF por voo',               title: 'Relatório de voo imprimível',     desc: 'Gere e imprima o relatório completo por voo com logo da companhia, tempos de cada fase, GSE usado, pessoal, contagens e assinaturas de ambos os supervisores.' },
      { tag: 'KPIs para companhias',      title: 'Relatórios agregados mensais',    desc: 'Entregue a cada companhia suas estatísticas de OTP, atrasos com código IATA, cancelamentos e tempos médios. Prontos para exportar e apresentar.' },
      { tag: 'Calendário de operações',   title: 'Vista mês / semana / dia',        desc: 'Programe e gerencie todos os voos do dia. Vistas mensal, semanal e diária. Cada voo atribuído com companhia, horário e agentes.' },
      { tag: 'Controle de pessoal',       title: 'Funções e onboarding por QR',    desc: 'Funções diferenciadas para chefe, supervisor e agentes de pista. Onboarding de pessoal via QR ou email. Controle total de quem opera cada voo.' },
      { tag: 'Catálogo de companhias',    title: 'Logos oficiais integrados',       desc: 'Catálogo completo com logos oficiais das principais companhias. Relatórios profissionais e consistentes sem configuração adicional.' },
    ],
    screensTitle: 'O app em ação',
    screensSub: 'Interface criada para a operação real de pista — rápida, precisa e sem papel.',
    screensLabels: ['Calendário', 'Voos', 'Relatório companhia', 'Live Board', 'Turnaround', 'Login', 'Vista semana', 'Contagens', 'Fechamento / assinaturas', 'Relatórios'],
    iataTitle: 'Construído sobre padrões IATA · IGOM / AHM',
    iataSub: 'i-Handler GTPS implementa os benchmarks de tempo IATA IGOM e AHM para que sua operação seja internacionalmente comparável e auditável.',
    iataPoints: [
      'Metas de turnaround por categoria de aeronave (narrow / wide body)',
      'Codificação de atrasos com código IATA padrão',
      'Registro completo de todos os subprocessos do turnaround',
      'Relatórios KPI prontos para auditoria da companhia',
      'Assinaturas digitais de ambos os supervisores em cada relatório',
      'Multi-idioma: Português · English · Español · Français · عربي',
    ],
    bagTitle: 'Para handlers, FBOs e companhias aéreas',
    bagSub: 'Do handler regional à companhia que exige dados precisos de turnaround — i-Handler GTPS conecta os dois mundos com dados reais e relatórios profissionais.',
    downloadTitle: 'Pronto para começar?',
    downloadSub: 'Baixe o i-Handler GTPS, crie sua empresa e comece a registrar seus primeiros voos de teste completamente gratuitos. Sem contratos, sem compromissos.',
    downloadNote: 'Download gratuito · Voos de teste incluídos · iOS e Android',
  },
} as const;

type Lang = keyof typeof t;

const screenshots = [
  '01-calendar', '02-flights', '03-airline-report', '04-live-board', '05-turnaround',
  '06-login', '07-calendar-week', '08-counts', '09-signoff', '10-reports',
];

// ── Inline SVG icons for features ─────────────────────────────────────────────
const FeatureIcons: JSX.Element[] = [
  // 0 — one-tap / stopwatch
  <svg key="0" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="13" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l3 3"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 2h6M12 2v3"/></svg>,
  // 1 — target / IATA
  <svg key="1" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  // 2 — live board
  <svg key="2" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="3" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M8 21h8M12 17v4"/><path strokeLinecap="round" d="M7 8h2M11 8h6M7 11h4M13 11h4"/></svg>,
  // 3 — gantt/diagram
  <svg key="3" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="5" width="8" height="3" rx="1"/><rect x="7" y="10" width="10" height="3" rx="1"/><rect x="5" y="15" width="12" height="3" rx="1"/><path strokeLinecap="round" d="M3 20h18"/></svg>,
  // 4 — PDF/print
  <svg key="4" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 14h12v8H6z"/></svg>,
  // 5 — KPI chart
  <svg key="5" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-4 4 4 4-5"/></svg>,
  // 6 — calendar
  <svg key="6" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>,
  // 7 — staff / QR
  <svg key="7" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  // 8 — airline catalog
  <svg key="8" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>,
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GTPSPage() {
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
            <Image src="/images/gtps/hero-bg.jpg" alt="Ground crew operations" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-black/65" />
          </div>

          {/* Language switcher */}
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
              {/* GTPS Logo */}
              <div className="mb-5">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-2 border-white/10">
                  <Image src="/images/gtps/gtps-logo.jpg" alt="i-Handler GTPS" width={80} height={80} className="w-full h-full object-cover" />
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
              <p className="text-lg text-gray-300 mb-6 max-w-lg">{txt.heroSub}</p>

              <p className="text-xs text-[#FC8C00] font-semibold uppercase tracking-wider mb-6">{txt.trialNote}</p>

              {/* App Store buttons */}
              <div className="flex flex-wrap gap-3">
                <a href="#" className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
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

            {/* Right — iPhone mockup with turnaround screenshot */}
            <div className="flex justify-center items-end pb-0">
              <div className="relative">
                <div className="relative w-56 md:w-64 rounded-[3rem] overflow-hidden border-[6px] border-white/20 shadow-2xl shadow-black/60 bg-black">
                  <Image src="/images/gtps/screenshots/04-live-board.png" alt="GTPS Live Board" width={256} height={554} className="w-full h-auto object-cover" />
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
                { num: '50K+',  label: txt.statsF },
                { num: '200+',  label: txt.statsH },
                { num: '150+',  label: txt.statsA },
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
                const isHero = i === 0;
                return (
                  <div key={i} className={`rounded-2xl p-6 border flex gap-4 ${isHero ? 'bg-gradient-to-br from-[#F34707] to-[#FC8C00] border-transparent sm:col-span-2 lg:col-span-1' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow ${isHero ? 'bg-white/20 text-white' : 'bg-white border border-gray-200 text-[#F34707]'}`}>
                      {FeatureIcons[i]}
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

        {/* ── IATA / IGOM TRUST SECTION ───────────────────────────────────── */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/gtps/iata-bg.jpg" alt="Airport worker with tablet" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FC8C00]" />
                IATA · IGOM / AHM
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{txt.iataTitle}</h2>
              <p className="text-gray-400 text-sm mb-8">{txt.iataSub}</p>
              <ul className="space-y-3">
                {txt.iataPoints.map((p, i) => (
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
            {/* Right — Live board screenshot large */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm">
                <button
                  onClick={() => setLightbox('/images/gtps/screenshots/04-live-board.png')}
                  className="block w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:border-[#F34707]/40 transition-all cursor-zoom-in"
                >
                  <Image src="/images/gtps/screenshots/04-live-board.png" alt="GTPS Live Board" width={400} height={866} className="w-full h-auto object-cover" />
                </button>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#F34707]/20 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ── IPHONE SCREENSHOTS ──────────────────────────────────────────── */}
        <section className="py-20 bg-gray-900 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{txt.screensTitle}</h2>
            <p className="text-gray-400 text-sm">{txt.screensSub}</p>
          </div>
          <div className="flex gap-5 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
            {screenshots.map((s, i) => (
              <div key={i} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                <button
                  onClick={() => setLightbox(`/images/gtps/screenshots/${s}.png`)}
                  className="w-36 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in"
                >
                  <Image src={`/images/gtps/screenshots/${s}.png`} alt={txt.screensLabels[i]} width={144} height={310} className="w-full h-auto object-cover" />
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
                  onClick={() => setLightbox(`/images/gtps/screenshots-ipad/${s}.png`)}
                  className="w-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in"
                >
                  <Image src={`/images/gtps/screenshots-ipad/${s}.png`} alt={txt.screensLabels[i]} width={256} height={192} className="w-full h-auto object-cover" />
                </button>
                <span className="text-gray-500 text-xs">{txt.screensLabels[i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHO IS IT FOR ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 px-4">
          <div className="absolute inset-0">
            <Image src="/images/gtps/handlers-bg.jpg" alt="Ground crew directing aircraft" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/70" />
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
              <Image src="/images/gtps/gtps-logo.jpg" alt="GTPS" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{txt.downloadTitle}</h2>
            <p className="text-gray-500 mb-8 text-lg max-w-xl mx-auto">{txt.downloadSub}</p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a href="#" className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-base transition-colors shadow-lg">
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
