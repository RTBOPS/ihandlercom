'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ── i18n ──────────────────────────────────────────────────────────────────────
const t = {
  ES: {
    badge: 'i-Handler HRS',
    hero1: 'Tu dotación, siempre lista',
    hero2: 'para la auditoría.',
    heroSub: 'i-Handler HRS centraliza la capacitación, recertificación y habilitación del personal de rampa según los estándares ISAGO / IATA (IGOM · AHM). Academia e-learning, semáforo de vencimientos, certificados verificables con QR y auto-auditoría — todo en una app que tu equipo usa desde el celular, en su idioma.',
    ctaDemo: 'Solicitar una demo',
    ctaHow: 'Ver cómo funciona',
    trialNote: 'Sin tarjeta. Suscripción mensual por empleado. Funciona en cualquier dispositivo.',
    problemBadge: 'El problema',
    problemTitle: 'Las planillas de Excel no aprueban auditorías.',
    problemBody: 'En ground handling, una sola certificación vencida es un riesgo operacional y un hallazgo de auditoría. Con alta rotación, múltiples estaciones y personal multilingüe, saber quién está habilitado para qué —y desde cuándo— se vuelve imposible de rastrear a mano. La auditoría ISAGO llega, y el equipo pasa semanas armando evidencia que debería estar a un clic.',
    problemCta: 'i-Handler HRS convierte esa carrera en una rutina.',
    statsE: 'Empleados gestionados',
    statsC: 'Cursos completados',
    statsA: 'Auditorías superadas',
    statsI: 'Conformidad ISAGO/IATA',
    statsNote: 'Solución lista para operaciones multiestación y multipaís · ES · EN · PT · FR · AR',
    featTitle: 'Todo lo que necesita tu área de RR.HH.',
    featSub: 'Ocho módulos integrados que cubren el ciclo completo de habilitación del personal aeronáutico.',
    features: [
      { tag: 'Academia e-learning',        title: '19 cursos trilingües listos',         desc: 'Rampa, pushback, marshalling, GSE, mercancías peligrosas, AVSEC, familiarización de aeronaves y más. Alineados a IGOM, AHM e ISAGO GOSM. Tiempo de estudio, examen con nota mínima y registro automático. También registras capacitación presencial.' },
      { tag: 'Malla curricular',           title: 'Plan de cursos por cargo y equipo',   desc: 'Cada cargo tiene su plan de cursos iniciales y recurrentes; cada grupo de equipo GSE, los suyos. Editable por tu empresa. El sistema sabe quién queda habilitado — automáticamente.' },
      { tag: 'Semáforo de vencimientos',   title: 'Verde, ámbar, rojo. Siempre.',        desc: 'Calendario con vistas Mes/Semana/Día y avisos configurables (60/30/15 días) para cursos, recertificaciones, licencias y documentos. Filtra por estación. Nunca más te sorprende un vencimiento.' },
      { tag: 'Certificados con QR',        title: 'Diplomas verificables al instante',   desc: 'Cada curso aprobado genera un diploma con QR de verificación pública. Cualquier autoridad escanea y confirma autenticidad y vigencia. Certificados Recurrent con Libro Matriz, folio y doble firma — formato listo para ISAGO.' },
      { tag: 'Auto-auditoría ISAGO/IATA',  title: 'Sabe dónde estás antes de que lleguen', desc: 'Evalúa tu cumplimiento con tus propios datos y muestra un semáforo por punto. Genera el informe PDF (ISAGO o IATA) de lo que cumple y lo que falta. Llega a la auditoría sabiendo exactamente dónde estás parado.' },
      { tag: 'Competencias y equipos',     title: 'Matriz de competencias y GSE',        desc: 'Competencias core y gerenciales, tarjeta de habilitación de equipos GSE y línea de reporte (accountability ISAGO) con supervisores de 1° y 2° nivel. Toda la trazabilidad que el auditor pide.' },
      { tag: 'Reportes en PDF',            title: 'Lo que antes tomaba días',            desc: 'Dotación, Libro Matriz, Plan Anual de Capacitación, Actas de Examen, Control de Tercerizados, Matriz RECURREM y constructor de reportes a medida — todos en PDF con tu logo y tus firmas.' },
      { tag: 'Portal del empleado',        title: 'Autoservicio desde el celular',       desc: 'Cada persona ve su capacitación, calendario y competencias, y sube sus propias licencias. Acceso por QR o credenciales. Menos trabajo para RR.HH., más responsabilidad en cada empleado.' },
    ],
    screensTitle: 'La app en acción',
    screensSub: 'Interfaz diseñada para RR.HH., supervisores y agentes de rampa — rápida, clara, en tu idioma.',
    trustBadge: 'Estándares de la industria',
    trustTitle: 'Construido sobre los marcos que tu operación ya conoce.',
    trustSub: 'ISAGO GOSM · IATA IGOM · IATA AHM. Datos protegidos por accesos por empresa y rol, cifrado en tránsito y reglas de seguridad del lado del servidor.',
    trustPoints: [
      'ISAGO GOSM — Ground Operations Safety Management',
      'IATA IGOM — International Ground Operations Manual',
      'IATA AHM — Airport Handling Manual',
      'Certificados con QR de verificación pública',
      'Multi-idioma: Español · English · Português · Français · عربي',
      'Multi-estación y multi-país desde el día uno',
    ],
    benefitsBadge: 'Por qué importa',
    benefits: [
      { title: 'Aprueba auditorías con tranquilidad',  desc: 'Evidencia ISAGO/IATA siempre lista, no improvisada.' },
      { title: 'Reduce el riesgo operacional',          desc: 'Nadie opera un equipo o aeronave sin estar habilitado y vigente.' },
      { title: 'Ahorra cientos de horas',               desc: 'Lo que era seguimiento manual ahora es automático.' },
      { title: 'Escala a toda tu red',                  desc: 'Multi-estación, multi-país, multi-idioma desde el día uno.' },
      { title: 'Profesionaliza tu marca',               desc: 'Certificados verificables y reportes con tu identidad.' },
    ],
    forWhomBadge: 'Para quién es',
    forWhomTitle: 'Handlers, FBOs y aerolíneas.',
    forWhomBody: 'Empresas de handling en tierra, FBOs y aerolíneas que necesitan mantener su personal de rampa capacitado, habilitado y auditable bajo estándares ISAGO/IATA — sin depender de planillas ni de la memoria de nadie.',
    priceBadge: 'Precio',
    priceTitle: 'Simple y predecible.',
    priceSub: 'Suscripción mensual por empleado activo. Pagas por la dotación que gestionas, ni más ni menos. Sin paquetes raros, sin sorpresas.',
    priceCta: 'Solicitar precio para mi operación →',
    downloadTitle: 'Lleva tu cumplimiento de "esperemos pasar" a "estamos listos".',
    downloadSub: 'Agenda una demo y mira cómo i-Handler HRS deja a tu dotación auditable en minutos.',
    ctaDemo2: 'Solicitar una demo',
    ctaTeam: 'Hablar con el equipo',
    tagline: '"ISAGO-ready, todos los días."',
  },
  EN: {
    badge: 'i-Handler HRS',
    hero1: 'Your crew, always ready',
    hero2: 'for the audit.',
    heroSub: 'i-Handler HRS centralizes training, recertification and qualification of ground staff to ISAGO / IATA standards (IGOM · AHM). E-learning academy, expiry traffic lights, QR-verifiable certificates and self-audit — all in an app your team uses from their phone, in their language.',
    ctaDemo: 'Request a demo',
    ctaHow: 'See how it works',
    trialNote: 'No card. Monthly subscription per employee. Works on any device.',
    problemBadge: 'The problem',
    problemTitle: 'Excel spreadsheets don\'t pass audits.',
    problemBody: 'In ground handling, a single expired certification is an operational risk and an audit finding. With high turnover, multiple stations and multilingual staff, knowing who is qualified for what — and since when — becomes impossible to track manually. The ISAGO audit arrives and the team spends weeks building evidence that should be one click away.',
    problemCta: 'i-Handler HRS turns that scramble into a routine.',
    statsE: 'Employees managed',
    statsC: 'Courses completed',
    statsA: 'Audits passed',
    statsI: 'ISAGO/IATA compliance',
    statsNote: 'Ready for multi-station and multi-country operations · ES · EN · PT · FR · AR',
    featTitle: 'Everything your HR department needs',
    featSub: 'Eight integrated modules covering the full qualification lifecycle of aeronautical personnel.',
    features: [
      { tag: 'E-learning academy',         title: '19 trilingual courses ready to go',   desc: 'Ramp, pushback, marshalling, GSE, dangerous goods, AVSEC, aircraft familiarization and more. Aligned with IGOM, AHM and ISAGO GOSM. Study time, graded exam and automatic record. Classroom training also logged.' },
      { tag: 'Training curriculum',        title: 'Course plan by role and equipment',   desc: 'Each role has its initial and recurrent course plan; each GSE group has its own. Editable by your company. The system knows who is qualified — automatically.' },
      { tag: 'Expiry traffic light',       title: 'Green, amber, red. Always.',          desc: 'Calendar with Month/Week/Day views and configurable alerts (60/30/15 days) for courses, recertifications, licenses and documents. Filter by station. Never caught off guard by an expiry again.' },
      { tag: 'QR certificates',            title: 'Instantly verifiable diplomas',       desc: 'Every passed course generates a diploma with a public QR verification code. Any authority scans and confirms authenticity and validity. Recurrent certificates with Matrix Log, folio and dual signature — ISAGO-ready format.' },
      { tag: 'ISAGO/IATA self-audit',      title: 'Know where you stand before they arrive', desc: 'Evaluate your compliance with your own data and see a traffic light per checkpoint. Generate the PDF report (ISAGO or IATA) showing what passes and what is missing. Arrive at the audit knowing exactly where you stand.' },
      { tag: 'Competencies & equipment',   title: 'Competency matrix and GSE cards',     desc: 'Core and managerial competencies, GSE equipment qualification card and reporting line (ISAGO accountability) with 1st and 2nd level supervisors. All the traceability the auditor requires.' },
      { tag: 'PDF reports',                title: 'What used to take days',              desc: 'Staffing, Matrix Log, Annual Training Plan, Exam Records, Third-Party Control, RECURREM Matrix and a custom report builder — all in PDF with your logo and signatures.' },
      { tag: 'Employee self-service',      title: 'Self-service from their phone',       desc: 'Each person sees their training, calendar and competencies, and uploads their own licenses. Access by QR or credentials. Less work for HR, more responsibility for each employee.' },
    ],
    screensTitle: 'The app in action',
    screensSub: 'Interface designed for HR, supervisors and ramp agents — fast, clear, in your language.',
    trustBadge: 'Industry standards',
    trustTitle: 'Built on the frameworks your operation already knows.',
    trustSub: 'ISAGO GOSM · IATA IGOM · IATA AHM. Data protected by company and role-based access, encryption in transit and server-side security rules.',
    trustPoints: [
      'ISAGO GOSM — Ground Operations Safety Management',
      'IATA IGOM — International Ground Operations Manual',
      'IATA AHM — Airport Handling Manual',
      'QR-verifiable public certificates',
      'Multi-language: English · Español · Português · Français · عربي',
      'Multi-station and multi-country from day one',
    ],
    benefitsBadge: 'Why it matters',
    benefits: [
      { title: 'Pass audits with confidence',      desc: 'ISAGO/IATA evidence always ready, never improvised.' },
      { title: 'Reduce operational risk',           desc: 'Nobody operates equipment or an aircraft without being qualified and current.' },
      { title: 'Save hundreds of hours',            desc: 'What was manual tracking is now automatic.' },
      { title: 'Scale across your network',         desc: 'Multi-station, multi-country, multi-language from day one.' },
      { title: 'Professionalize your brand',        desc: 'Verifiable certificates and reports with your identity.' },
    ],
    forWhomBadge: 'Who it\'s for',
    forWhomTitle: 'Handlers, FBOs and airlines.',
    forWhomBody: 'Ground handling companies, FBOs and airlines that need to keep their ramp staff trained, qualified and auditable under ISAGO/IATA standards — without relying on spreadsheets or anyone\'s memory.',
    priceBadge: 'Pricing',
    priceTitle: 'Simple and predictable.',
    priceSub: 'Monthly subscription per active employee. You pay for the staff you manage, nothing more. No strange packages, no surprises.',
    priceCta: 'Request pricing for my operation →',
    downloadTitle: 'Move your compliance from "hope we pass" to "we\'re ready".',
    downloadSub: 'Schedule a demo and see how i-Handler HRS makes your entire workforce audit-ready in minutes.',
    ctaDemo2: 'Request a demo',
    ctaTeam: 'Talk to the team',
    tagline: '"ISAGO-ready, every day."',
  },
  PT: {
    badge: 'i-Handler HRS',
    hero1: 'Sua equipe, sempre pronta',
    hero2: 'para a auditoria.',
    heroSub: 'i-Handler HRS centraliza o treinamento, a recertificação e a habilitação do pessoal de pista conforme os padrões ISAGO / IATA (IGOM · AHM). Academia e-learning, semáforo de vencimentos, certificados verificáveis com QR e autoauditoria — tudo em um app que sua equipe usa pelo celular, no seu idioma.',
    ctaDemo: 'Solicitar uma demo',
    ctaHow: 'Ver como funciona',
    trialNote: 'Sem cartão. Assinatura mensal por funcionário. Funciona em qualquer dispositivo.',
    problemBadge: 'O problema',
    problemTitle: 'Planilhas Excel não passam em auditorias.',
    problemBody: 'No ground handling, uma única certificação vencida é um risco operacional e um achado de auditoria. Com alta rotatividade, múltiplas estações e pessoal multilíngue, saber quem está habilitado para quê — e desde quando — torna-se impossível de rastrear manualmente. A auditoria ISAGO chega e a equipe passa semanas montando evidências que deveriam estar a um clique.',
    problemCta: 'i-Handler HRS transforma esse caos em rotina.',
    statsE: 'Funcionários gerenciados',
    statsC: 'Cursos concluídos',
    statsA: 'Auditorias aprovadas',
    statsI: 'Conformidade ISAGO/IATA',
    statsNote: 'Pronto para operações multi-estação e multi-país · ES · EN · PT · FR · AR',
    featTitle: 'Tudo que seu RH precisa',
    featSub: 'Oito módulos integrados cobrindo o ciclo completo de habilitação do pessoal aeronáutico.',
    features: [
      { tag: 'Academia e-learning',        title: '19 cursos trilíngues prontos',        desc: 'Pista, pushback, marshalling, GSE, mercadorias perigosas, AVSEC, familiarização de aeronaves e mais. Alinhados ao IGOM, AHM e ISAGO GOSM. Tempo de estudo, prova com nota mínima e registro automático. Treinamento presencial também registrado.' },
      { tag: 'Grade curricular',           title: 'Plano de cursos por cargo e equip.',  desc: 'Cada cargo tem seu plano de cursos iniciais e recorrentes; cada grupo de equipamento GSE, o seu. Editável pela sua empresa. O sistema sabe quem está habilitado — automaticamente.' },
      { tag: 'Semáforo de vencimentos',    title: 'Verde, âmbar, vermelho. Sempre.',     desc: 'Calendário com vistas Mês/Semana/Dia e alertas configuráveis (60/30/15 dias) para cursos, recertificações, licenças e documentos. Filtra por estação. Nunca mais surpreendido por um vencimento.' },
      { tag: 'Certificados com QR',        title: 'Diplomas verificáveis na hora',       desc: 'Cada curso aprovado gera um diploma com QR de verificação pública. Qualquer autoridade escaneia e confirma autenticidade e vigência. Certificados Recorrentes com Livro Matriz, fólio e assinatura dupla — formato pronto para ISAGO.' },
      { tag: 'Autoauditoria ISAGO/IATA',   title: 'Saiba onde está antes que cheguem',   desc: 'Avalie sua conformidade com seus próprios dados e veja um semáforo por ponto. Gere o relatório PDF (ISAGO ou IATA) do que está em conformidade e do que falta. Chegue à auditoria sabendo exatamente onde está.' },
      { tag: 'Competências e equipam.',    title: 'Matriz de competências e GSE',        desc: 'Competências core e gerenciais, cartão de habilitação de equipamentos GSE e linha de reporte (accountability ISAGO) com supervisores de 1° e 2° nível. Toda a rastreabilidade que o auditor exige.' },
      { tag: 'Relatórios PDF',             title: 'O que antes levava dias',             desc: 'Quadro de pessoal, Livro Matriz, Plano Anual de Treinamento, Atas de Exame, Controle de Terceirizados, Matriz RECURREM e construtor de relatórios personalizado — todos em PDF com seu logo e assinaturas.' },
      { tag: 'Portal do funcionário',      title: 'Autoatendimento pelo celular',        desc: 'Cada pessoa vê seu treinamento, calendário e competências, e envia suas próprias licenças. Acesso por QR ou credenciais. Menos trabalho para o RH, mais responsabilidade para cada funcionário.' },
    ],
    screensTitle: 'O app em ação',
    screensSub: 'Interface projetada para RH, supervisores e agentes de pista — rápida, clara, no seu idioma.',
    trustBadge: 'Padrões da indústria',
    trustTitle: 'Construído sobre os frameworks que sua operação já conhece.',
    trustSub: 'ISAGO GOSM · IATA IGOM · IATA AHM. Dados protegidos por acessos por empresa e função, criptografia em trânsito e regras de segurança no servidor.',
    trustPoints: [
      'ISAGO GOSM — Ground Operations Safety Management',
      'IATA IGOM — International Ground Operations Manual',
      'IATA AHM — Airport Handling Manual',
      'Certificados com QR de verificação pública',
      'Multi-idioma: Português · English · Español · Français · عربي',
      'Multi-estação e multi-país desde o primeiro dia',
    ],
    benefitsBadge: 'Por que importa',
    benefits: [
      { title: 'Passe auditorias com tranquilidade',  desc: 'Evidências ISAGO/IATA sempre prontas, nunca improvisadas.' },
      { title: 'Reduza o risco operacional',           desc: 'Ninguém opera equipamento ou aeronave sem estar habilitado e em dia.' },
      { title: 'Economize centenas de horas',          desc: 'O que era rastreamento manual agora é automático.' },
      { title: 'Escale por toda a sua rede',           desc: 'Multi-estação, multi-país, multi-idioma desde o primeiro dia.' },
      { title: 'Profissionalize sua marca',            desc: 'Certificados verificáveis e relatórios com a sua identidade.' },
    ],
    forWhomBadge: 'Para quem é',
    forWhomTitle: 'Handlers, FBOs e companhias aéreas.',
    forWhomBody: 'Empresas de handling em terra, FBOs e companhias aéreas que precisam manter seu pessoal de pista treinado, habilitado e auditável sob padrões ISAGO/IATA — sem depender de planilhas nem da memória de ninguém.',
    priceBadge: 'Preço',
    priceTitle: 'Simples e previsível.',
    priceSub: 'Assinatura mensal por funcionário ativo. Você paga pela equipe que gerencia, nada mais. Sem pacotes estranhos, sem surpresas.',
    priceCta: 'Solicitar preço para minha operação →',
    downloadTitle: 'Leve sua conformidade de "esperamos passar" para "estamos prontos".',
    downloadSub: 'Agende uma demo e veja como o i-Handler HRS deixa toda a sua equipe auditável em minutos.',
    ctaDemo2: 'Solicitar uma demo',
    ctaTeam: 'Falar com a equipe',
    tagline: '"ISAGO-ready, todos os dias."',
  },
} as const;

type Lang = keyof typeof t;

const screenshots = [
  'IMG_0198', 'IMG_0199', 'IMG_0200', 'IMG_0201', 'IMG_0202',
  'IMG_0203', 'IMG_0204', 'IMG_0205', 'IMG_0206', 'IMG_0207',
];

// ── Feature icons ─────────────────────────────────────────────────────────────
const FeatureIcons: JSX.Element[] = [
  // 0 academy
  <svg key="0" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 8l10 5 10-5-10-5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 8v8M22 8v8M6 10.5v5a6 6 0 0012 0v-5"/></svg>,
  // 1 curriculum
  <svg key="1" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M3 9h18M9 21V9"/></svg>,
  // 2 traffic light
  <svg key="2" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="7" r="2" fill="currentColor" className="opacity-40"/><circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-70"/><circle cx="12" cy="17" r="2" fill="currentColor"/></svg>,
  // 3 QR cert
  <svg key="3" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/><path strokeLinecap="round" d="M14 14h3v3M17 14h3M14 17v3M17 20h3"/></svg>,
  // 4 audit checkmark
  <svg key="4" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  // 5 competency matrix
  <svg key="5" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  // 6 PDF report
  <svg key="6" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  // 7 employee portal
  <svg key="7" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="5" y="2" width="14" height="20" rx="2"/><path strokeLinecap="round" d="M12 18h.01M9 7h6M9 11h4"/></svg>,
];

// ── Benefit icons ─────────────────────────────────────────────────────────────
const BenefitIcons: JSX.Element[] = [
  <svg key="0" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  <svg key="1" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  <svg key="2" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>,
  <svg key="3" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/><circle cx="12" cy="12" r="9"/></svg>,
  <svg key="4" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z"/></svg>,
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HRSPage() {
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
          <div className="absolute inset-0">
            <Image src="/images/hrs/hero-bg.jpg" alt="HR professional at desk" fill className="object-cover object-center" priority />
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
              <div className="mb-5">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-2 border-white/10">
                  <Image src="/images/hrs/hrs-logo.jpg" alt="i-Handler HRS" width={80} height={80} className="w-full h-full object-cover" />
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

              <div className="flex flex-wrap gap-3 mb-5">
                <a href="mailto:operations@i-handler.app?subject=HRS Demo Request"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-base transition-colors shadow-lg">
                  {txt.ctaDemo} →
                </a>
                <a href="#features"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-colors">
                  {txt.ctaHow}
                </a>
              </div>
              <p className="text-xs text-white/50">{txt.trialNote}</p>
            </div>

            {/* Right — iPhone mockup */}
            <div className="flex justify-center items-end pb-0">
              <div className="relative">
                <div className="relative w-56 md:w-64 rounded-[3rem] overflow-hidden border-[6px] border-white/20 shadow-2xl shadow-black/60 bg-black">
                  <Image src={`/images/hrs/screenshots/${screenshots[0]}.PNG`} alt="HRS App" width={256} height={554} className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-[#F34707]/30 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM SECTION ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0">
            <Image src="/images/hrs/problem-bg.jpg" alt="Team reviewing data" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/80" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold mb-6 uppercase tracking-wider">
              {txt.problemBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{txt.problemTitle}</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">{txt.problemBody}</p>
            <p className="text-[#FC8C00] font-bold text-xl">{txt.problemCta}</p>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-200 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { num: '10K+',  label: txt.statsE },
                { num: '80K+',  label: txt.statsC },
                { num: '300+',  label: txt.statsA },
                { num: '100%',  label: txt.statsI },
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
        <section id="features" className="py-20 px-4 bg-white">
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
            {screenshots.map((s, i) => (
              <div key={i} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                <button
                  onClick={() => setLightbox(`/images/hrs/screenshots/${s}.PNG`)}
                  className="w-36 rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in"
                >
                  <Image src={`/images/hrs/screenshots/${s}.PNG`} alt={`HRS screen ${i + 1}`} width={144} height={310} className="w-full h-auto object-cover" />
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
            {screenshots.map((s, i) => (
              <div key={i} className="flex-shrink-0 snap-center">
                <button
                  onClick={() => setLightbox(`/images/hrs/screenshots-ipad/${s}.PNG`)}
                  className="w-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl hover:border-[#F34707]/60 hover:scale-105 transition-all cursor-zoom-in block"
                >
                  <Image src={`/images/hrs/screenshots-ipad/${s}.PNG`} alt={`HRS iPad screen ${i + 1}`} width={256} height={192} className="w-full h-auto object-cover" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRUST / STANDARDS ───────────────────────────────────────────── */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/hrs/trust-bg.jpg" alt="Aviation engineer" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/20 border border-[#F34707]/30 text-[#FC8C00] text-xs font-semibold mb-5 uppercase tracking-wider">
                {txt.trustBadge}
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
            {/* Tagline card */}
            <div className="flex justify-center">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-10 text-center shadow-2xl max-w-sm w-full">
                <div className="text-5xl mb-6">✅</div>
                <p className="text-2xl font-bold text-white italic leading-snug">{txt.tagline}</p>
                <div className="mt-8 flex justify-center gap-6 text-gray-500 text-xs font-semibold uppercase tracking-widest">
                  <span>ISAGO</span><span>·</span><span>IGOM</span><span>·</span><span>AHM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS ────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/10 border border-[#F34707]/20 text-[#F34707] text-xs font-semibold mb-4 uppercase tracking-wider">
                {txt.benefitsBadge}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {txt.benefits.map((b, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F34707]/10 flex items-center justify-center text-[#F34707]">
                    {BenefitIcons[i]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{b.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50 border-y border-gray-200 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F34707]/10 border border-[#F34707]/20 text-[#F34707] text-xs font-semibold mb-5 uppercase tracking-wider">
              {txt.priceBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{txt.priceTitle}</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">{txt.priceSub}</p>
            <a href="mailto:operations@i-handler.app?subject=HRS Pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-base transition-colors shadow-lg">
              {txt.priceCta}
            </a>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
        <section className="relative py-24 px-4 overflow-hidden text-center">
          <div className="absolute inset-0">
            <Image src="/images/hrs/cta-bg.jpg" alt="Aviation team with laptops" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-black/75" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden mx-auto mb-6 shadow-xl">
              <Image src="/images/hrs/hrs-logo.jpg" alt="HRS" width={80} height={80} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{txt.downloadTitle}</h2>
            <p className="text-gray-300 mb-10 text-lg">{txt.downloadSub}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:operations@i-handler.app?subject=HRS Demo Request"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#F34707] hover:bg-[#d93d06] text-white font-bold text-base transition-colors shadow-lg">
                {txt.ctaDemo2} →
              </a>
              <a href="mailto:operations@i-handler.app?subject=HRS Info"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-colors">
                {txt.ctaTeam}
              </a>
            </div>
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
