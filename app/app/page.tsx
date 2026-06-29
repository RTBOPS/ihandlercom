'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const t = {
  ES: {
    badge: 'i-Handler App',
    hero1: 'Operaciones de aviación',
    hero2: 'en tu bolsillo.',
    heroSub: 'Planificación de vuelos, información de aeropuertos, permisos de sobrevuelo, documentación de aeronaves y coordinación con handlers y FBOs — todo desde una sola app, en tiempo real.',
    webApp: 'Abrir Web App',
    statsA: 'Aeropuertos',
    statsC: 'Países con cobertura',
    statsH: 'Handlers y FBOs',
    statsF: 'Vuelos operados',
    statsNote: 'La plataforma de operaciones más completa para aviación privada y corporativa · iOS · Android · Web',
    featTitle: 'Una plataforma. Todo lo que necesitas.',
    featSub: 'Diseñada para operadores, pilotos y handlers que necesitan información precisa y coordinación fluida en cada vuelo.',
    features: [
      { tag: 'Planificación de vuelo',      title: 'Trip sheet completo',              desc: 'Genera tu trip sheet con toda la información del vuelo: aeronave, tripulación, pasajeros, combustible, ruta y documentación. Listo para imprimir o compartir.' },
      { tag: 'Aeropuertos globales',         title: '8,000+ aeropuertos',               desc: 'Base de datos actualizada de aeropuertos con códigos ICAO/IATA, información de handling, FBOs disponibles, frecuencias, procedimientos y horarios de operación.' },
      { tag: 'Permisos de sobrevuelo',       title: 'OFLP por país',                    desc: 'Información de permisos de sobrevuelo y aterrizaje (OFLP) por país. Requisitos, contactos, formularios y tiempos de tramitación actualizados.' },
      { tag: 'Documentación de aeronave',    title: 'Docs siempre a la mano',           desc: 'Almacena y accede a toda la documentación de tu aeronave: matrícula, seguro, aeronavegabilidad, licencias y certificados — sin papel, siempre disponible.' },
      { tag: 'Pasajeros y tripulación',      title: 'Manifiestos y APIS',               desc: 'Gestiona pasajeros, tripulación y generación de manifiestos. Compatible con APIS para vuelos internacionales a EE.UU. y otros países.' },
      { tag: 'Handlers y FBOs',             title: 'Base de datos actualizada',         desc: 'Directorio de handlers y FBOs con contactos, servicios disponibles, precios de combustible y calificaciones. Coordina tu escala desde la app.' },
      { tag: 'Reporte meteorológico',        title: 'Tiempo en ruta',                   desc: 'Consulta el reporte meteorológico de salida, destino y alternos. METAR, TAF y pronóstico integrados para una mejor toma de decisiones.' },
      { tag: 'Multi-aeronave',              title: 'Gestiona toda tu flota',            desc: 'Administra múltiples aeronaves desde una sola cuenta. Ideal para operadores, charter y empresas con flota propia.' },
    ],
    screensTitle: 'La app en acción',
    screensSub: 'Interfaz diseñada para pilotos y operadores de aviación — precisa, rápida y siempre disponible.',
    downloadTitle: 'Tu próximo vuelo, mejor preparado.',
    downloadSub: 'Descarga i-Handler App y gestiona tus operaciones desde cualquier dispositivo.',
    downloadNote: 'Descarga gratis · iOS · Android · Web App',
  },
  EN: {
    badge: 'i-Handler App',
    hero1: 'Aviation operations',
    hero2: 'in your pocket.',
    heroSub: 'Flight planning, airport information, overflight permits, aircraft documentation and coordination with handlers and FBOs — all from a single app, in real time.',
    webApp: 'Open Web App',
    statsA: 'Airports',
    statsC: 'Countries covered',
    statsH: 'Handlers & FBOs',
    statsF: 'Flights operated',
    statsNote: 'The most complete operations platform for private and corporate aviation · iOS · Android · Web',
    featTitle: 'One platform. Everything you need.',
    featSub: 'Built for operators, pilots and handlers who need accurate information and smooth coordination on every flight.',
    features: [
      { tag: 'Flight planning',             title: 'Complete trip sheet',              desc: 'Generate your trip sheet with all flight information: aircraft, crew, passengers, fuel, route and documentation. Ready to print or share.' },
      { tag: 'Global airports',             title: '8,000+ airports',                  desc: 'Updated airport database with ICAO/IATA codes, handling information, available FBOs, frequencies, procedures and operating hours.' },
      { tag: 'Overflight permits',          title: 'OFLP by country',                  desc: 'Overflight and landing permit (OFLP) information by country. Updated requirements, contacts, forms and processing times.' },
      { tag: 'Aircraft documentation',      title: 'Docs always at hand',              desc: 'Store and access all your aircraft documentation: registration, insurance, airworthiness, licenses and certificates — paperless, always available.' },
      { tag: 'Passengers & crew',           title: 'Manifests and APIS',               desc: 'Manage passengers, crew and manifest generation. APIS compatible for international flights to the US and other countries.' },
      { tag: 'Handlers & FBOs',            title: 'Updated database',                  desc: 'Handler and FBO directory with contacts, available services, fuel prices and ratings. Coordinate your stop from the app.' },
      { tag: 'Weather report',             title: 'En-route weather',                   desc: 'Check weather reports for departure, destination and alternates. Integrated METAR, TAF and forecast for better decision-making.' },
      { tag: 'Multi-aircraft',             title: 'Manage your entire fleet',           desc: 'Manage multiple aircraft from a single account. Ideal for operators, charter companies and businesses with their own fleet.' },
    ],
    screensTitle: 'The app in action',
    screensSub: 'Designed for pilots and aviation operators — precise, fast and always available.',
    downloadTitle: 'Your next flight, better prepared.',
    downloadSub: 'Download i-Handler App and manage your operations from any device.',
    downloadNote: 'Free download · iOS · Android · Web App',
  },
  PT: {
    badge: 'i-Handler App',
    hero1: 'Operações de aviação',
    hero2: 'no seu bolso.',
    heroSub: 'Planejamento de voo, informações de aeroportos, licenças de sobrevoo, documentação de aeronaves e coordenação com handlers e FBOs — tudo em um único app, em tempo real.',
    webApp: 'Abrir Web App',
    statsA: 'Aeroportos',
    statsC: 'Países cobertos',
    statsH: 'Handlers e FBOs',
    statsF: 'Voos operados',
    statsNote: 'A plataforma de operações mais completa para aviação privada e corporativa · iOS · Android · Web',
    featTitle: 'Uma plataforma. Tudo que você precisa.',
    featSub: 'Criada para operadores, pilotos e handlers que precisam de informações precisas e coordenação fluida em cada voo.',
    features: [
      { tag: 'Planejamento de voo',         title: 'Trip sheet completo',              desc: 'Gere sua trip sheet com todas as informações do voo: aeronave, tripulação, passageiros, combustível, rota e documentação. Pronto para imprimir ou compartilhar.' },
      { tag: 'Aeroportos globais',          title: '8.000+ aeroportos',                desc: 'Base de dados atualizada de aeroportos com códigos ICAO/IATA, informações de handling, FBOs disponíveis, frequências, procedimentos e horários de operação.' },
      { tag: 'Licenças de sobrevoo',        title: 'OFLP por país',                    desc: 'Informações de licenças de sobrevoo e pouso (OFLP) por país. Requisitos, contatos, formulários e prazos de processamento atualizados.' },
      { tag: 'Documentação da aeronave',    title: 'Docs sempre à mão',               desc: 'Armazene e acesse toda a documentação da sua aeronave: registro, seguro, aeronavegabilidade, licenças e certificados — sem papel, sempre disponível.' },
      { tag: 'Passageiros e tripulação',    title: 'Manifestos e APIS',                desc: 'Gerencie passageiros, tripulação e geração de manifestos. Compatível com APIS para voos internacionais aos EUA e outros países.' },
      { tag: 'Handlers e FBOs',            title: 'Base de dados atualizada',          desc: 'Diretório de handlers e FBOs com contatos, serviços disponíveis, preços de combustível e avaliações. Coordene sua escala pelo app.' },
      { tag: 'Relatório meteorológico',     title: 'Tempo na rota',                    desc: 'Consulte o relatório meteorológico de partida, destino e alternos. METAR, TAF e previsão integrados para melhor tomada de decisão.' },
      { tag: 'Multi-aeronave',             title: 'Gerencie toda a sua frota',         desc: 'Administre várias aeronaves a partir de uma única conta. Ideal para operadores, charter e empresas com frota própria.' },
    ],
    screensTitle: 'O app em ação',
    screensSub: 'Projetado para pilotos e operadores de aviação — preciso, rápido e sempre disponível.',
    downloadTitle: 'Seu próximo voo, melhor preparado.',
    downloadSub: 'Baixe o i-Handler App e gerencie suas operações de qualquer dispositivo.',
    downloadNote: 'Download gratuito · iOS · Android · Web App',
  },
} as const;

type Lang = keyof typeof t;

const iPhoneScreenshots = Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0'));
const iPadScreenshots   = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'));

const FeatureIcons: JSX.Element[] = [
  <svg key="0" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>,
  <svg key="1" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  <svg key="2" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  <svg key="3" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  <svg key="4" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  <svg key="5" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="7" width="20" height="14" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 12v4M10 14h4"/></svg>,
  <svg key="6" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z"/></svg>,
  <svg key="7" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="5" y="2" width="14" height="20" rx="2"/><path strokeLinecap="round" d="M12 18h.01M9 7h6M9 11h4"/></svg>,
];

export default function IHandlerAppPage() {
  const [lang, setLang] = useState<Lang>('EN');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const txt = t[lang];
  const langFlags: Record<Lang, string> = { ES: '🇪🇸', EN: '🇺🇸', PT: '🇧🇷' };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-0 min-h-[85vh] flex items-center bg-gradient-to-br from-[#0a0f1e] via-[#0d1535] to-[#111827]">
          {/* grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#F34707]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

          {/* Language switcher */}
          <div className="absolute top-20 right-4 md:right-8 z-20 flex gap-1 bg-black/40 backdrop-blur-sm rounded-xl p-1">
            {(['ES','EN','PT'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === l ? 'bg-[#F34707] text-white shadow' : 'text-white/60 hover:text-white'}`}>
                <span>{langFlags[l]}</span><span>{l}</span>
              </button>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center py-16">
            <div>
              <div className="mb-5 w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-2 border-white/10">
                <Image src="/images/ihandler-app/app-logo.jpg" alt="i-Handler App" width={80} height={80} className="w-full h-full object-cover" />
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

              {/* Download buttons */}
              <div className="flex flex-wrap gap-3">
                <a href="https://apps.apple.com/us/app/i-handler-app/id6740422816" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-left"><div className="text-[10px] text-white/60 leading-none">Download on the</div><div className="text-sm font-semibold leading-tight">App Store</div></div>
                </a>
                <a href="#" className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.98.06l13.07-7.53-2.75-2.75-11.3 10.22zM.44 1.06C.17 1.4 0 1.88 0 2.53v18.94c0 .65.17 1.12.44 1.47l.08.07 10.6-10.6v-.25L.52.99l-.08.07zM20.13 10.3l-2.85-1.64-3.08 3.08 3.08 3.08 2.87-1.66c.82-.47.82-1.24-.02-1.86zM3.18.24L16.25 7.77l-2.75 2.75L2.2.3c.32-.14.68-.12.98-.06z"/></svg>
                  <div className="text-left"><div className="text-[10px] text-white/60 leading-none">Get it on</div><div className="text-sm font-semibold leading-tight">Google Play</div></div>
                </a>
                <a href="https://i-handler.app" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#F34707]/20 border border-[#F34707]/40 text-white hover:bg-[#F34707]/30 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                  <div className="text-left"><div className="text-[10px] text-white/60 leading-none">Open</div><div className="text-sm font-semibold leading-tight">{txt.webApp}</div></div>
                </a>
              </div>
            </div>

            {/* iPhone mockup */}
            <div className="flex justify-center items-end">
              <div className="relative">
                <div className="relative w-56 md:w-64 rounded-[3rem] overflow-hidden border-[6px] border-white/20 shadow-2xl shadow-black/60 bg-black">
                  <Image src="/images/ihandler-app/screenshots/27.png" alt="i-Handler App" width={256} height={554} className="w-full h-auto object-cover" />
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
                { num: '8K+',   label: txt.statsA },
                { num: '180+',  label: txt.statsC },
                { num: '500+',  label: txt.statsH },
                { num: '100K+', label: txt.statsF },
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

        {/* ── IPHONE SCREENSHOTS ──────────────────────────────────────────── */}
        <section className="py-20 bg-gray-900 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{txt.screensTitle}</h2>
            <p className="text-gray-400 text-sm">{txt.screensSub}</p>
          </div>
          <div className="flex gap-5 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
            {iPhoneScreenshots.map((s) => (
              <div key={s} className="flex-shrink-0 snap-center">
                <button onClick={() => setLightbox(`/images/ihandler-app/screenshots/${s}.png`)}
                  className="w-36 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in block">
                  <Image src={`/images/ihandler-app/screenshots/${s}.png`} alt="i-Handler App" width={144} height={310} className="w-full h-auto object-cover" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── IPAD SCREENSHOTS ────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-950 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-4 uppercase tracking-wider">iPad</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{txt.screensTitle}</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
            {iPadScreenshots.map((s) => (
              <div key={s} className="flex-shrink-0 snap-center">
                <button onClick={() => setLightbox(`/images/ihandler-app/screenshots-ipad/${s}.png`)}
                  className="w-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in block">
                  <Image src={`/images/ihandler-app/screenshots-ipad/${s}.png`} alt="i-Handler App iPad" width={256} height={192} className="w-full h-auto object-cover" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── DOWNLOAD CTA ────────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden mx-auto mb-6 shadow-xl">
              <Image src="/images/ihandler-app/app-logo.jpg" alt="i-Handler App" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{txt.downloadTitle}</h2>
            <p className="text-gray-500 mb-8 text-lg max-w-xl mx-auto">{txt.downloadSub}</p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a href="https://apps.apple.com/us/app/i-handler-app/id6740422816" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-base transition-colors shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div className="text-left"><div className="text-[10px] text-white/60 leading-none">Download on the</div><div className="text-base font-bold leading-tight">App Store</div></div>
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-base transition-colors shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.98.06l13.07-7.53-2.75-2.75-11.3 10.22zM.44 1.06C.17 1.4 0 1.88 0 2.53v18.94c0 .65.17 1.12.44 1.47l.08.07 10.6-10.6v-.25L.52.99l-.08.07zM20.13 10.3l-2.85-1.64-3.08 3.08 3.08 3.08 2.87-1.66c.82-.47.82-1.24-.02-1.86zM3.18.24L16.25 7.77l-2.75 2.75L2.2.3c.32-.14.68-.12.98-.06z"/></svg>
                <div className="text-left"><div className="text-[10px] text-white/60 leading-none">Get it on</div><div className="text-base font-bold leading-tight">Google Play</div></div>
              </a>
              <a href="https://i-handler.app" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-[#F34707] hover:bg-[#d93d06] text-white font-semibold text-base transition-colors shadow-lg">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                <div className="text-left"><div className="text-[10px] text-white/80 leading-none">Open</div><div className="text-base font-bold leading-tight">{txt.webApp}</div></div>
              </a>
            </div>
            <p className="text-xs text-gray-400 font-medium">{txt.downloadNote}</p>
          </div>
        </section>

        {/* ── LIGHTBOX ────────────────────────────────────────────────────── */}
        {lightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setLightbox(null)}>
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <Image src={lightbox} alt="Screenshot" width={800} height={1600} className="max-h-[85vh] w-auto h-auto object-contain rounded-3xl shadow-2xl" />
              <button onClick={() => setLightbox(null)} className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
