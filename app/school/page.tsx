import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const certifications = [
  'Private Pilot (PPL)', 'Instrument Rating (IFR)', 'Commercial Pilot (CPL)',
  'Airline Transport Pilot (ATP)', 'Flight Instructor (CFI)', 'Multi-Engine Rating',
  'Ground School', 'Aircraft Dispatcher', 'Air Traffic Control', 'Aviation Maintenance',
  'Remote Pilot (Drone)', 'Sport Pilot', 'Flight Navigator',
];

const features = [
  {
    icon: '🎙️',
    title: 'Modo Voz Manos Libres',
    subtitle: 'Tu killer feature',
    desc: 'Practica mientras conduces, corres o haces escala. El app lee las preguntas en voz alta y acepta tus respuestas por voz — sin tocar la pantalla.',
    highlight: true,
  },
  {
    icon: '🌎',
    title: 'Español · Inglés · Portugués',
    subtitle: 'Único en el mercado',
    desc: 'Preguntas y explicaciones en tu idioma. Material oficial FAA traducido y verificado — no una traducción de Google.',
    highlight: false,
  },
  {
    icon: '📚',
    title: 'Manuales Oficiales Incluidos',
    subtitle: 'Biblioteca FAA completa',
    desc: 'FAR/AIM, Pilot\'s Handbook, Weather Services y más — todos dentro del app, sin necesidad de conexión.',
    highlight: false,
  },
  {
    icon: '📊',
    title: 'Enfócate en lo que Fallas',
    subtitle: 'Estudio inteligente',
    desc: 'El algoritmo identifica tus áreas débiles y te da más preguntas donde las necesitas. Estadísticas detalladas por tema.',
    highlight: false,
  },
];

const steps = [
  { num: '01', title: 'Elige tu certificación', desc: 'PPL, IFR, CPL, ATP, Dispatcher y más. 13 cursos disponibles.' },
  { num: '02', title: 'Practica a tu manera', desc: 'Modo pantalla o modo voz manos libres — en tu idioma.' },
  { num: '03', title: 'Aprueba a la primera', desc: 'Banco oficial FAA actualizado. Sin sorpresas el día del examen.' },
];

const faqs = [
  {
    q: '¿Las preguntas son las mismas que en el examen real?',
    a: 'Sí. Usamos el banco oficial de preguntas FAA, el mismo que se usa en los centros de examen autorizados. Se actualiza cada vez que la FAA hace cambios.',
  },
  {
    q: '¿Necesito conexión a internet?',
    a: 'Una vez descargado el curso, puedes practicar sin internet. Ideal para estudiar en el aeropuerto, en vuelo o en zonas sin señal.',
  },
  {
    q: '¿Puedo cambiar de curso o certificación?',
    a: 'Sí. Puedes tener múltiples cursos activos al mismo tiempo. Si ya tienes el PPL y vas por el IFR, tus estadísticas se guardan por separado.',
  },
  {
    q: '¿El modo de voz funciona en español y portugués?',
    a: 'Sí, en los tres idiomas. Puedes cambiar el idioma en cualquier momento sin perder tu progreso.',
  },
  {
    q: '¿Qué pasa si repruebo el examen?',
    a: 'Reprobar cuesta $175+ y semanas de espera. Por eso nos enfocamos en tus áreas débiles antes de que vayas al centro de examen. La mayoría de usuarios aprueba al primer intento.',
  },
];

const segments = [
  {
    emoji: '🎓',
    title: '¿Estudiante de PPL?',
    desc: 'Aprueba el written test desde el primer intento. En tu idioma, sin perderte en inglés técnico.',
    cta: 'Empezar con PPL',
  },
  {
    emoji: '✈️',
    title: '¿Vas por tu ATP o CPL?',
    desc: 'Estudia entre vuelos con el modo voz. Material actualizado para ratings avanzados.',
    cta: 'Ver cursos avanzados',
  },
  {
    emoji: '🗺️',
    title: '¿Dispatcher o ATC?',
    desc: 'Los únicos recursos completos en español para profesionales de aviación. Sin pagar cursos caros.',
    cta: 'Ver cursos profesionales',
  },
];

export default function SchoolPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 pt-32 pb-24 px-4">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F34707]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FC8C00]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-6 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FC8C00] animate-pulse" />
                i-Handler School
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Aprueba tu examen<br />
                de piloto FAA{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">
                  a la primera
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Preguntas oficiales FAA en español, inglés y portugués. Estudia hasta con la voz — sin tocar la pantalla.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#" className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </a>
                <a href="#" className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.65.19.98.07l12.57-7.25-2.84-2.85-10.71 10zM.35 1.84C.13 2.17 0 2.6 0 3.14v17.73c0 .54.13.97.36 1.3l.07.07 9.93-9.93v-.23L.42 1.77l-.07.07zM20.94 10.38l-2.79-1.61-3.16 3.16 3.16 3.16 2.82-1.63c.8-.46.8-1.22-.03-1.68zM4.16.25L16.73 7.5l-2.84 2.84L3.18.59C3.51.41 3.86.43 4.16.25z"/>
                  </svg>
                  Google Play
                </a>
              </div>
              <p className="text-gray-400 text-sm">✓ Gratis con 15 preguntas · Sin tarjeta requerida</p>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Phone shell */}
                <div className="w-64 h-[520px] bg-gray-900 rounded-[3rem] border-4 border-gray-700 shadow-2xl overflow-hidden relative">
                  {/* Status bar */}
                  <div className="bg-gray-950 h-8 flex items-center justify-between px-6">
                    <span className="text-white text-xs font-medium">9:41</span>
                    <div className="w-20 h-5 bg-gray-950 rounded-full" />
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-white rounded-sm" />
                    </div>
                  </div>
                  {/* App header */}
                  <div className="bg-gradient-to-r from-[#F34707] to-[#FC8C00] px-4 py-4">
                    <p className="text-white/80 text-xs mb-1">Private Pilot — PPL</p>
                    <p className="text-white font-bold text-base">Pregunta 47 de 60</p>
                    <div className="mt-2 h-1.5 bg-white/20 rounded-full">
                      <div className="h-full bg-white rounded-full" style={{width:'78%'}} />
                    </div>
                  </div>
                  {/* Question */}
                  <div className="px-4 py-4 bg-white flex-1">
                    <p className="text-gray-800 text-sm font-medium leading-snug mb-4">
                      ¿Cuál es la altitud mínima de vuelo sobre una zona urbana bajo VFR?
                    </p>
                    {/* Options */}
                    {['500 ft sobre el obstáculo más alto', '1,000 ft sobre el obstáculo más alto', '1,500 ft AGL', '2,000 ft AGL'].map((opt, i) => (
                      <div key={i} className={`mb-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${i === 1 ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                        {i === 1 && <span className="mr-1">✓</span>}{opt}
                      </div>
                    ))}
                    {/* Voice btn */}
                    <div className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F34707]/10 border border-[#F34707]/20">
                      <div className="w-6 h-6 rounded-full bg-[#F34707] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                        </svg>
                      </div>
                      <span className="text-[#F34707] text-xs font-semibold">Modo Voz Activo</span>
                    </div>
                  </div>
                </div>
                {/* Glow under phone */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#F34707]/30 blur-xl rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ────────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-200 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { num: '900+', label: 'Preguntas oficiales FAA' },
                { num: '13', label: 'Certificaciones cubiertas' },
                { num: '3', label: 'Idiomas disponibles' },
                { num: '1ra', label: 'App FAA en español + voz' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold text-[#F34707] mb-1">{s.num}</div>
                  <div className="text-sm text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">Basado en el banco oficial de preguntas FAA · Actualizado regularmente</p>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Diseñado para{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">aprobar</span>
                , no solo para estudiar
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">Cada feature resuelve un problema real de quien estudia para su licencia de piloto.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((f) => (
                <div key={f.title} className={`rounded-2xl p-6 border ${f.highlight ? 'bg-gradient-to-br from-[#F34707] to-[#FC8C00] border-transparent text-white' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${f.highlight ? 'text-white/70' : 'text-[#F34707]'}`}>{f.subtitle}</div>
                  <h3 className={`text-xl font-bold mb-2 ${f.highlight ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                  <p className={`text-sm leading-relaxed ${f.highlight ? 'text-white/85' : 'text-gray-500'}`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-950">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Así de simple</h2>
            <p className="text-gray-400 mb-14">Tres pasos para llegar al centro de examen con confianza.</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <div key={s.num} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#F34707]/50 to-transparent z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F34707] to-[#FC8C00] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#F34707]/30">
                      <span className="text-white font-bold text-xl">{s.num}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-400 text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CERTIFICATIONS ───────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">13 certificaciones cubiertas</h2>
            <p className="text-gray-500 text-sm mb-10">Desde tu primer vuelo hasta capitán de aerolínea.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {certifications.map((c) => (
                <span key={c} className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium hover:border-[#F34707]/40 hover:text-[#F34707] transition-colors">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Planes transparentes</h2>
              <p className="text-gray-500">Reprobar el examen FAA cuesta $175+. Invertir en preparación cuesta mucho menos.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  name: 'Gratis',
                  price: '$0',
                  period: 'para siempre',
                  features: ['15 preguntas de práctica', '1 certificación', 'Modo pantalla', 'Stats básicas'],
                  cta: 'Descargar gratis',
                  highlight: false,
                },
                {
                  name: 'Pro',
                  price: '$4.99',
                  period: '/mes',
                  features: ['Banco completo FAA', '1 certificación completa', 'Modo voz manos libres', 'Manuales incluidos', 'Stats detalladas por tema'],
                  cta: 'Empezar Pro',
                  highlight: true,
                },
                {
                  name: 'Todo Acceso',
                  price: '$9.99',
                  period: '/mes',
                  features: ['Todo en Pro', '13 certificaciones', 'Español + inglés + portugués', 'Actualizaciones FAA incluidas', 'Soporte prioritario'],
                  cta: 'Todo Acceso',
                  highlight: false,
                },
              ].map((plan) => (
                <div key={plan.name} className={`rounded-2xl p-6 border ${plan.highlight ? 'bg-gradient-to-br from-[#F34707] to-[#FC8C00] border-transparent shadow-xl shadow-[#F34707]/20' : 'bg-white border-gray-200'}`}>
                  {plan.highlight && <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-3">Más popular</div>}
                  <div className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</div>
                  <div className={`mb-6 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ml-1 ${plan.highlight ? 'text-white/70' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? 'text-white/90' : 'text-gray-600'}`}>
                        <span className={`mt-0.5 ${plan.highlight ? 'text-white' : 'text-[#F34707]'}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-white text-[#F34707] hover:bg-gray-100' : 'bg-[#F34707] text-white hover:bg-[#d93d06]'}`}>
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEGMENTS ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Dónde estás en tu carrera?</h2>
              <p className="text-gray-500">i-Handler School se adapta a tu nivel y objetivos.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {segments.map((s) => (
                <div key={s.title} className="rounded-2xl border border-gray-200 p-6 hover:border-[#F34707]/40 hover:shadow-md transition-all group">
                  <div className="text-4xl mb-4">{s.emoji}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#F34707] transition-colors">{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{s.desc}</p>
                  <a href="#" className="text-[#F34707] text-sm font-semibold hover:underline">{s.cta} →</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Preguntas frecuentes</h2>
              <p className="text-gray-500 text-sm">Lo que quieres saber antes de descargar.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="py-24 px-4 bg-gradient-to-br from-gray-950 to-gray-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F34707]/10 blur-3xl" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Tu licencia está<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F34707] to-[#FC8C00]">más cerca de lo que crees</span>
            </h2>
            <p className="text-gray-300 mb-10 text-lg">Empieza gratis hoy. Sin tarjeta de crédito.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-base hover:bg-gray-100 transition-colors shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Descargar en App Store
              </a>
              <a href="#" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-base transition-colors shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.3.17.65.19.98.07l12.57-7.25-2.84-2.85-10.71 10zM.35 1.84C.13 2.17 0 2.6 0 3.14v17.73c0 .54.13.97.36 1.3l.07.07 9.93-9.93v-.23L.42 1.77l-.07.07zM20.94 10.38l-2.79-1.61-3.16 3.16 3.16 3.16 2.82-1.63c.8-.46.8-1.22-.03-1.68zM4.16.25L16.73 7.5l-2.84 2.84L3.18.59C3.51.41 3.86.43 4.16.25z"/>
                </svg>
                Descargar en Google Play
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-6">i-Handler School es parte del ecosistema i-Handler · International Aviation Support</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
