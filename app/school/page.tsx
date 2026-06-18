'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── i18n ─────────────────────────────────────────────────────────────────────
const t = {
  ES: {
    badge: 'i-Handler School',
    hero1: 'Aprueba tu examen de piloto FAA',
    hero2: 'a la primera',
    heroSub: 'Preguntas oficiales, en tu idioma. Estudia hasta con la voz — sin tocar la pantalla.',
    free: 'Gratis con 15 preguntas · Sin tarjeta requerida',
    statsQ: 'Preguntas oficiales FAA',
    statsCert: 'Certificaciones cubiertas',
    statsLang: 'Idiomas disponibles',
    statsUnique: 'Única app FAA en español + voz',
    statsNote: 'Basado en el banco oficial de preguntas FAA · Actualizado regularmente',
    featTitle: 'Diseñado para aprobar, no solo para estudiar',
    featSub: 'Cada función resuelve un problema real de quien estudia para su licencia de piloto.',
    features: [
      { icon: '/images/school/icons/ppl.png', tag: 'Tu killer feature', title: 'Modo Voz Manos Libres', desc: 'Practica mientras conduces, corres o haces escala. El app lee las preguntas en voz alta y acepta tus respuestas por voz.' },
      { icon: '/images/school/icons/combo.png', tag: 'Único en el mercado', title: 'Español · Inglés · Portugués', desc: 'Preguntas y explicaciones en tu idioma. Material oficial FAA traducido y verificado.' },
      { icon: '/images/school/icons/single.png', tag: 'Biblioteca FAA completa', title: 'Manuales Oficiales Incluidos', desc: 'FAR/AIM, Pilot\'s Handbook, Weather Services y más — todos dentro del app, sin conexión.' },
      { icon: '/images/school/icons/pilots.png', tag: 'Estudio inteligente', title: 'Enfócate en lo que Fallas', desc: 'El algoritmo identifica tus áreas débiles y te da más preguntas donde las necesitas. Estadísticas detalladas por tema.' },
    ],
    screenshotsTitle: 'Diseñado para iPhone y iPad',
    screensSub: 'Una experiencia nativa en todos tus dispositivos Apple.',
    howTitle: 'Así de simple',
    howSub: 'Tres pasos para llegar al centro de examen con confianza.',
    steps: [
      { num: '01', title: 'Elige tu certificación', desc: 'PPL, IFR, CPL, ATP, Dispatcher y más. 13 cursos disponibles.' },
      { num: '02', title: 'Practica a tu manera', desc: 'Modo pantalla o modo voz manos libres — en tu idioma.' },
      { num: '03', title: 'Aprueba a la primera', desc: 'Banco oficial FAA actualizado. Sin sorpresas el día del examen.' },
    ],
    certsTitle: '13 certificaciones cubiertas',
    certsSub: 'Desde tu primer vuelo hasta capitán de aerolínea.',
    pricingTitle: 'Planes transparentes',
    pricingSub: 'Reprobar el examen FAA cuesta $175+. Prepararte cuesta mucho menos.',
    monthly: 'Mensual',
    annual: 'Anual',
    lifetime: 'Lifetime',
    mostPop: 'Más popular',
    bestVal: 'Mejor valor',
    perMonth: '/mes',
    perYear: '/año',
    equivMonth: 'equiv.',
    subscribe: 'Suscribirse',
    faqTitle: 'Preguntas frecuentes',
    faqSub: 'Lo que quieres saber antes de descargar.',
    faqs: [
      { q: '¿Las preguntas son las mismas que en el examen real?', a: 'Sí. Usamos el banco oficial de preguntas FAA, el mismo que se usa en los centros de examen autorizados. Se actualiza cada vez que la FAA hace cambios.' },
      { q: '¿Necesito conexión a internet?', a: 'Una vez descargado el curso, puedes practicar sin internet. Ideal para estudiar en el aeropuerto, en vuelo o en zonas sin señal.' },
      { q: '¿Puedo cambiar de curso o certificación?', a: 'Sí. Puedes tener múltiples cursos activos al mismo tiempo y tus estadísticas se guardan por separado.' },
      { q: '¿El modo de voz funciona en español y portugués?', a: 'Sí, en los tres idiomas. Puedes cambiar el idioma en cualquier momento sin perder tu progreso.' },
      { q: '¿Qué pasa si repruebo el examen?', a: 'Reprobar cuesta $175+ y semanas de espera. Por eso nos enfocamos en tus áreas débiles antes de que vayas al centro de examen.' },
    ],
    ctaH1: 'Tu licencia está',
    ctaH2: 'más cerca de lo que crees',
    ctaSub: 'Empieza gratis hoy. Sin tarjeta de crédito.',
    appStore: 'Descargar en App Store',
    googlePlay: 'Descargar en Google Play',
    footer: 'i-Handler School es parte del ecosistema i-Handler · International Aviation Support',
  },
  EN: {
    badge: 'i-Handler School',
    hero1: 'Pass your FAA pilot exam',
    hero2: 'on the first try',
    heroSub: 'Official questions, in your language. Study even by voice — without touching the screen.',
    free: 'Free with 15 questions · No card required',
    statsQ: 'Official FAA questions',
    statsCert: 'Certifications covered',
    statsLang: 'Available languages',
    statsUnique: 'Only FAA app in Spanish + voice',
    statsNote: 'Based on the official FAA question bank · Regularly updated',
    featTitle: 'Built to pass, not just to study',
    featSub: 'Every feature solves a real problem for pilot license candidates.',
    features: [
      { icon: '/images/school/icons/ppl.png', tag: 'Your killer feature', title: 'Hands-Free Voice Mode', desc: 'Practice while driving, running, or during a layover. The app reads questions aloud and accepts your voice answers.' },
      { icon: '/images/school/icons/combo.png', tag: 'Unique on the market', title: 'Spanish · English · Portuguese', desc: 'Questions and explanations in your language. Official FAA material translated and verified.' },
      { icon: '/images/school/icons/single.png', tag: 'Full FAA library', title: 'Official Manuals Included', desc: 'FAR/AIM, Pilot\'s Handbook, Weather Services and more — all inside the app, offline.' },
      { icon: '/images/school/icons/pilots.png', tag: 'Smart study', title: 'Focus on Your Weak Areas', desc: 'The algorithm identifies your weak spots and gives you more questions where you need them. Detailed stats by topic.' },
    ],
    screenshotsTitle: 'Built for iPhone and iPad',
    screensSub: 'A native experience on all your Apple devices.',
    howTitle: 'That simple',
    howSub: 'Three steps to walk into the testing center with confidence.',
    steps: [
      { num: '01', title: 'Choose your certification', desc: 'PPL, IFR, CPL, ATP, Dispatcher and more. 13 courses available.' },
      { num: '02', title: 'Practice your way', desc: 'Screen mode or hands-free voice mode — in your language.' },
      { num: '03', title: 'Pass on the first try', desc: 'Updated FAA official question bank. No surprises on exam day.' },
    ],
    certsTitle: '13 certifications covered',
    certsSub: 'From your first flight to airline captain.',
    pricingTitle: 'Transparent plans',
    pricingSub: 'Failing the FAA exam costs $175+. Preparing costs much less.',
    monthly: 'Monthly',
    annual: 'Annual',
    lifetime: 'Lifetime',
    mostPop: 'Most popular',
    bestVal: 'Best value',
    perMonth: '/mo',
    perYear: '/yr',
    equivMonth: 'equiv.',
    subscribe: 'Subscribe',
    faqTitle: 'Frequently asked questions',
    faqSub: 'What you want to know before downloading.',
    faqs: [
      { q: 'Are the questions the same as the real exam?', a: 'Yes. We use the official FAA question bank, the same used at authorized testing centers. It is updated every time the FAA makes changes.' },
      { q: 'Do I need an internet connection?', a: 'Once the course is downloaded, you can practice offline. Perfect for studying at the airport, in-flight, or in areas without signal.' },
      { q: 'Can I switch courses or certifications?', a: 'Yes. You can have multiple active courses at the same time and your stats are saved separately for each.' },
      { q: 'Does voice mode work in Spanish and Portuguese?', a: 'Yes, in all three languages. You can switch languages at any time without losing your progress.' },
      { q: 'What if I fail the exam?', a: 'Failing costs $175+ and weeks of waiting. That\'s why we focus on your weak areas before you go to the testing center.' },
    ],
    ctaH1: 'Your license is',
    ctaH2: 'closer than you think',
    ctaSub: 'Start free today. No credit card.',
    appStore: 'Download on App Store',
    googlePlay: 'Download on Google Play',
    footer: 'i-Handler School is part of the i-Handler ecosystem · International Aviation Support',
  },
  PT: {
    badge: 'i-Handler School',
    hero1: 'Passe no exame de piloto FAA',
    hero2: 'na primeira tentativa',
    heroSub: 'Questões oficiais, no seu idioma. Estude até com a voz — sem tocar na tela.',
    free: 'Grátis com 15 questões · Sem cartão necessário',
    statsQ: 'Questões oficiais FAA',
    statsCert: 'Certificações cobertas',
    statsLang: 'Idiomas disponíveis',
    statsUnique: 'Único app FAA em português + voz',
    statsNote: 'Baseado no banco oficial de questões FAA · Atualizado regularmente',
    featTitle: 'Feito para passar, não só para estudar',
    featSub: 'Cada recurso resolve um problema real de quem estuda para sua licença de piloto.',
    features: [
      { icon: '/images/school/icons/ppl.png', tag: 'Seu recurso diferencial', title: 'Modo Voz Mãos Livres', desc: 'Pratique enquanto dirige, corre ou faz escala. O app lê as perguntas em voz alta e aceita suas respostas por voz.' },
      { icon: '/images/school/icons/combo.png', tag: 'Único no mercado', title: 'Português · Espanhol · Inglês', desc: 'Perguntas e explicações no seu idioma. Material oficial FAA traduzido e verificado.' },
      { icon: '/images/school/icons/single.png', tag: 'Biblioteca FAA completa', title: 'Manuais Oficiais Incluídos', desc: 'FAR/AIM, Pilot\'s Handbook, Weather Services e mais — tudo dentro do app, sem internet.' },
      { icon: '/images/school/icons/pilots.png', tag: 'Estudo inteligente', title: 'Foco nas suas Fraquezas', desc: 'O algoritmo identifica suas áreas fracas e te dá mais questões onde você precisa. Estatísticas detalhadas por tema.' },
    ],
    screenshotsTitle: 'Feito para iPhone e iPad',
    screensSub: 'Uma experiência nativa em todos os seus dispositivos Apple.',
    howTitle: 'Simples assim',
    howSub: 'Três passos para chegar ao centro de exame com confiança.',
    steps: [
      { num: '01', title: 'Escolha sua certificação', desc: 'PPL, IFR, CPL, ATP, Despachante e mais. 13 cursos disponíveis.' },
      { num: '02', title: 'Pratique do seu jeito', desc: 'Modo tela ou modo voz mãos livres — no seu idioma.' },
      { num: '03', title: 'Passe na primeira tentativa', desc: 'Banco oficial FAA atualizado. Sem surpresas no dia do exame.' },
    ],
    certsTitle: '13 certificações cobertas',
    certsSub: 'Do seu primeiro voo até capitão de companhia aérea.',
    pricingTitle: 'Planos transparentes',
    pricingSub: 'Reprovar no exame FAA custa $175+. Preparar-se custa muito menos.',
    monthly: 'Mensal',
    annual: 'Anual',
    lifetime: 'Vitalício',
    mostPop: 'Mais popular',
    bestVal: 'Melhor valor',
    perMonth: '/mês',
    perYear: '/ano',
    equivMonth: 'equiv.',
    subscribe: 'Assinar',
    faqTitle: 'Perguntas frequentes',
    faqSub: 'O que você quer saber antes de baixar.',
    faqs: [
      { q: 'As questões são as mesmas do exame real?', a: 'Sim. Usamos o banco oficial de questões FAA, o mesmo usado nos centros de exame autorizados. Atualizado sempre que a FAA faz mudanças.' },
      { q: 'Preciso de conexão à internet?', a: 'Após baixar o curso, você pode praticar sem internet. Ideal para estudar no aeroporto, em voo ou em áreas sem sinal.' },
      { q: 'Posso trocar de curso ou certificação?', a: 'Sim. Você pode ter vários cursos ativos ao mesmo tempo e suas estatísticas ficam separadas para cada um.' },
      { q: 'O modo de voz funciona em português e espanhol?', a: 'Sim, nos três idiomas. Você pode trocar o idioma a qualquer momento sem perder seu progresso.' },
      { q: 'E se eu reprovar no exame?', a: 'Reprovar custa $175+ e semanas de espera. Por isso focamos nas suas áreas fracas antes de você ir ao centro de exame.' },
    ],
    ctaH1: 'Sua licença está',
    ctaH2: 'mais perto do que você pensa',
    ctaSub: 'Comece grátis hoje. Sem cartão de crédito.',
    appStore: 'Baixar na App Store',
    googlePlay: 'Baixar no Google Play',
    footer: 'i-Handler School faz parte do ecossistema i-Handler · International Aviation Support',
  },
} as const;

type Lang = keyof typeof t;

// ── Certifications ────────────────────────────────────────────────────────────
const certs = [
  { icon: '/images/school/icons/ppl.png',    label: 'PPL',     name: 'Piloto Privado' },
  { icon: '/images/school/icons/ifr.png',    label: 'IFR',     name: 'Instrumental' },
  { icon: '/images/school/icons/com.png',    label: 'COM',     name: 'Piloto Comercial' },
  { icon: '/images/school/icons/cfi.png',    label: 'CFI',     name: 'Instructor de Vuelo' },
  { icon: '/images/school/icons/atp.png',    label: 'ATP',     name: 'Airline Transport' },
  { icon: '/images/school/icons/atprtc.png', label: 'ATP-RTC', name: 'ATP Restricted' },
  { icon: '/images/school/icons/atc.png',    label: 'ATC',     name: 'Control de Tránsito' },
  { icon: '/images/school/icons/adx.png',    label: 'ADX',     name: 'Despachador' },
  { icon: '/images/school/icons/nav.png',    label: 'NAV',     name: 'Navegante' },
  { icon: '/images/school/icons/man.png',    label: 'MAN',     name: 'Mantenimiento' },
  { icon: '/images/school/icons/tc.png',     label: 'TC',      name: 'Técnico de Cabina' },
  { icon: '/images/school/icons/heli.png',   label: 'HELI',    name: 'Helicóptero PPL' },
  { icon: '/images/school/icons/single.png', label: 'GND',     name: 'Ground School' },
];

// ── Pricing ───────────────────────────────────────────────────────────────────
const plansMonthly = [
  { icon: '/images/school/icons/single.png',    name: 'Curso Individual',      price: '$4.99',  includes: ['1 curso a elección'],                                              tag: '' },
  { icon: '/images/school/icons/pilots.png',    name: 'Pilotos de Avión',      price: '$9.99',  includes: ['PPL · IFR · COM', 'CFI · ATP · ATP-RTC'],                          tag: 'mostPop' },
  { icon: '/images/school/icons/ops.png',       name: 'Operaciones Aéreas',    price: '$5.99',  includes: ['ATC · Despachador', 'Navegante'],                                  tag: '' },
  { icon: '/images/school/icons/tec.png',       name: 'Técnicos Aeronáuticos', price: '$5.99',  includes: ['Mantenimiento Aeronáutico', 'Técnico de Cabina TC'],                tag: '' },
  { icon: '/images/school/icons/heli_group.png',name: 'Helicóptero',           price: '$4.99',  includes: ['Piloto Privado Helicóptero'],                                      tag: '' },
  { icon: '/images/school/icons/combo.png',     name: 'Todo Acceso',           price: '$14.99', includes: ['Todos los 13 cursos incluidos', 'Futuras actualizaciones sin costo'], tag: 'bestVal' },
];

const plansAnnual = [
  { icon: '/images/school/icons/single.png',    name: 'Curso Individual',      price: '$39.99',  equiv: '$3.33', includes: ['1 curso a elección'],                                              tag: '' },
  { icon: '/images/school/icons/pilots.png',    name: 'Pilotos de Avión',      price: '$79.99',  equiv: '$6.67', includes: ['PPL · IFR · COM', 'CFI · ATP · ATP-RTC'],                          tag: 'mostPop' },
  { icon: '/images/school/icons/ops.png',       name: 'Operaciones Aéreas',    price: '$44.99',  equiv: '$3.75', includes: ['ATC · Despachador', 'Navegante'],                                  tag: '' },
  { icon: '/images/school/icons/tec.png',       name: 'Técnicos Aeronáuticos', price: '$44.99',  equiv: '$3.75', includes: ['Mantenimiento Aeronáutico', 'Técnico de Cabina TC'],                tag: '' },
  { icon: '/images/school/icons/heli_group.png',name: 'Helicóptero',           price: '$34.99',  equiv: '$2.92', includes: ['Piloto Privado Helicóptero'],                                      tag: '' },
  { icon: '/images/school/icons/combo.png',     name: 'Todo Acceso',           price: '$109.99', equiv: '$9.17', includes: ['Todos los 13 cursos incluidos', 'Futuras actualizaciones sin costo'], tag: 'bestVal', lifetime: '$249.99' },
];

const iphoneScreenshots = [
  { src: '/images/school/screenshots/iphone_01.png', label: 'Inicio' },
  { src: '/images/school/screenshots/iphone_02.png', label: 'Estudio' },
  { src: '/images/school/screenshots/iphone_04.png', label: 'Modo Voz' },
  { src: '/images/school/screenshots/iphone_03.png', label: 'Temas' },
  { src: '/images/school/screenshots/iphone_07.png', label: 'Estadísticas' },
  { src: '/images/school/screenshots/iphone_05.png', label: 'Calculadora' },
  { src: '/images/school/screenshots/iphone_06.png', label: 'Notas' },
];

const ipadScreenshots = [
  { src: '/images/school/screenshots/ipad_01.png', label: 'Inicio' },
  { src: '/images/school/screenshots/ipad_02.png', label: 'Modo Voz' },
  { src: '/images/school/screenshots/ipad_03.png', label: 'Biblioteca' },
  { src: '/images/school/screenshots/ipad_04.png', label: 'Estadísticas' },
  { src: '/images/school/screenshots/ipad_05.png', label: 'Calculadora' },
];

// ── App Store SVGs ────────────────────────────────────────────────────────────
const AppleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.18 23.76c.3.17.65.19.98.07l12.57-7.25-2.84-2.85-10.71 10zM.35 1.84C.13 2.17 0 2.6 0 3.14v17.73c0 .54.13.97.36 1.3l.07.07 9.93-9.93v-.23L.42 1.77l-.07.07zM20.94 10.38l-2.79-1.61-3.16 3.16 3.16 3.16 2.82-1.63c.8-.46.8-1.22-.03-1.68zM4.16.25L16.73 7.5l-2.84 2.84L3.18.59C3.51.41 3.86.43 4.16.25z" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchoolPage() {
  const [lang, setLang] = useState<Lang>('ES');
  const [pricingTab, setPricingTab] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const txt = t[lang];

  const plans = pricingTab === 'monthly' ? plansMonthly : plansAnnual;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 pt-28 pb-20 px-4">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F34707]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FC8C00]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Language switcher */}
              <div className="flex gap-1 mb-6 w-fit bg-white/10 rounded-xl p-1">
                {(['ES','EN','PT'] as Lang[]).map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === l ? 'bg-[#F34707] text-white shadow' : 'text-white/60 hover:text-white'}`}>
                    {l}
                  </button>
                ))}
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

              <div className="flex flex-wrap gap-4 mb-6">
                <a href="#" className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  <AppleIcon /> {txt.appStore}
                </a>
                <a href="#" className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors">
                  <PlayIcon /> {txt.googlePlay}
                </a>
              </div>
              <p className="text-gray-400 text-sm">{txt.free}</p>
            </div>

            {/* App icon + badge */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-52 h-52 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-[#F34707]/30 border-4 border-white/10">
                  <Image src="/images/school/app-icon.png" alt="i-Handler School" width={208} height={208} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-6 bg-[#F34707]/40 blur-xl rounded-full" />
                {/* Language badges */}
                <div className="absolute -top-3 -right-3 flex gap-1">
                  {['ES','EN','PT'].map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded-full bg-[#F34707] text-white text-[10px] font-bold shadow">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-200 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { num: '900+', label: txt.statsQ },
                { num: '13',   label: txt.statsCert },
                { num: '3',    label: txt.statsLang },
                { num: '#1',   label: txt.statsUnique },
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

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {txt.featTitle.split('aprobar').length > 1 ? (
                  <>{txt.featTitle.split('aprobar')[0]}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">
                    {lang === 'ES' ? 'aprobar' : lang === 'EN' ? 'pass' : 'passar'}
                  </span>{txt.featTitle.split(lang === 'ES' ? 'aprobar' : lang === 'EN' ? 'pass' : 'passar')[1]}</>
                ) : txt.featTitle}
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">{txt.featSub}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {txt.features.map((f, i) => (
                <div key={i} className={`rounded-2xl p-6 border flex gap-4 ${i === 0 ? 'bg-gradient-to-br from-[#F34707] to-[#FC8C00] border-transparent' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shadow">
                    <Image src={f.icon} alt={f.title} width={48} height={48} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${i === 0 ? 'text-white/70' : 'text-[#F34707]'}`}>{f.tag}</div>
                    <h3 className={`text-lg font-bold mb-1 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                    <p className={`text-sm leading-relaxed ${i === 0 ? 'text-white/85' : 'text-gray-500'}`}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCREENSHOTS ───────────────────────────────────────────────────── */}
        <section className="py-20 bg-gray-950 overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{txt.screenshotsTitle}</h2>
            <p className="text-gray-400 text-sm">{txt.screensSub}</p>
          </div>

          {/* iPhone strip */}
          <div className="mb-8">
            <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-5">iPhone</p>
            <div className="flex gap-5 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
              {iphoneScreenshots.map((s, i) => (
                <div key={i} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                  <div className="w-36 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl">
                    <Image src={s.src} alt={s.label} width={144} height={310} className="w-full h-auto object-cover" />
                  </div>
                  <span className="text-gray-500 text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* iPad strip */}
          <div>
            <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-5">iPad</p>
            <div className="flex gap-6 overflow-x-auto px-8 pb-4 scrollbar-hide snap-x snap-mandatory">
              {ipadScreenshots.map((s, i) => (
                <div key={i} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                  <div className="w-56 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                    <Image src={s.src} alt={s.label} width={224} height={300} className="w-full h-auto object-cover" />
                  </div>
                  <span className="text-gray-500 text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{txt.howTitle}</h2>
            <p className="text-gray-500 mb-14 text-sm">{txt.howSub}</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {txt.steps.map((s, i) => (
                <div key={s.num} className="relative">
                  {i < txt.steps.length - 1 && (
                    <div className="hidden sm:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#F34707]/40 to-transparent z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F34707] to-[#FC8C00] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#F34707]/20">
                      <span className="text-white font-bold text-xl">{s.num}</span>
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CERTIFICATIONS ────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{txt.certsTitle}</h2>
            <p className="text-gray-500 text-sm mb-12">{txt.certsSub}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
              {certs.map((c) => (
                <div key={c.label} className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-gray-200 group-hover:shadow-lg group-hover:border-[#F34707]/30 transition-all">
                    <Image src={c.icon} alt={c.label} width={56} height={56} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-[#F34707]">{c.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{c.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{txt.pricingTitle}</h2>
              <p className="text-gray-500 text-sm mb-8">{txt.pricingSub}</p>
              {/* Tabs */}
              <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 gap-1">
                <button onClick={() => setPricingTab('monthly')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${pricingTab === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {txt.monthly}
                </button>
                <button onClick={() => setPricingTab('annual')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${pricingTab === 'annual' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {txt.annual}
                  <span className="absolute -top-2.5 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-40%</span>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan.name} className={`rounded-2xl border p-5 relative transition-all ${plan.tag === 'mostPop' ? 'border-[#F34707] shadow-lg shadow-[#F34707]/10 bg-orange-50/40' : plan.tag === 'bestVal' ? 'border-green-400 shadow-lg shadow-green-500/10 bg-green-50/40' : 'border-gray-200 bg-white'}`}>
                  {plan.tag === 'mostPop' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F34707] text-white text-xs font-bold rounded-full whitespace-nowrap">{txt.mostPop}</div>
                  )}
                  {plan.tag === 'bestVal' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full whitespace-nowrap">{txt.bestVal}</div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow border border-gray-100 flex-shrink-0">
                      <Image src={plan.icon} alt={plan.name} width={48} height={48} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{plan.name}</div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${plan.tag === 'mostPop' ? 'text-[#F34707]' : plan.tag === 'bestVal' ? 'text-green-600' : 'text-gray-900'}`}>{plan.price}</span>
                        <span className="text-gray-400 text-xs">{pricingTab === 'monthly' ? txt.perMonth : txt.perYear}</span>
                      </div>
                      {'equiv' in plan && (
                        <div className="text-xs text-gray-400">{txt.equivMonth} {(plan as {equiv: string}).equiv}{txt.perMonth}</div>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.includes.map((item) => (
                      <li key={item} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-[#F34707] font-bold mt-0.5">✓</span>{item}
                      </li>
                    ))}
                  </ul>
                  {'lifetime' in plan && pricingTab === 'annual' && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-gray-100 text-xs text-gray-500 text-center">
                      {txt.lifetime}: <span className="font-bold text-gray-800">{(plan as {lifetime: string}).lifetime}</span>
                    </div>
                  )}
                  <a href="#" className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.tag === 'mostPop' ? 'bg-[#F34707] text-white hover:bg-[#d93d06]' : plan.tag === 'bestVal' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                    {txt.subscribe}
                  </a>
                </div>
              ))}
            </div>

            {/* Paywall preview */}
            <div className="mt-16 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Precios en la app</p>
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="text-center">
                  <div className="w-48 rounded-[2rem] overflow-hidden border-2 border-gray-200 shadow-xl mx-auto">
                    <Image src="/images/school/paywall/mensual.png" alt="Mensual" width={192} height={400} className="w-full h-auto" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{txt.monthly}</p>
                </div>
                <div className="text-center">
                  <div className="w-48 rounded-[2rem] overflow-hidden border-2 border-gray-200 shadow-xl mx-auto">
                    <Image src="/images/school/paywall/anual.png" alt="Anual" width={192} height={400} className="w-full h-auto" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{txt.annual}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{txt.faqTitle}</h2>
              <p className="text-gray-500 text-sm">{txt.faqSub}</p>
            </div>
            <div className="space-y-3">
              {txt.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left">
                    <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-gradient-to-br from-gray-950 to-gray-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F34707]/10 blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {txt.ctaH1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">{txt.ctaH2}</span>
            </h2>
            <p className="text-gray-300 mb-10 text-lg">{txt.ctaSub}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-base hover:bg-gray-100 transition-colors shadow-lg">
                <AppleIcon /> {txt.appStore}
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-base transition-colors shadow-lg">
                <PlayIcon /> {txt.googlePlay}
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-8">{txt.footer}</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
