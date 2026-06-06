// ─── Payment Cards ────────────────────────────────────────────────────────────
// Logo via SimpleIcons CDN (open-source, no auth needed)
export type CardOption = { label: string; logo: string; bg: string };

export const PAYMENT_CARDS: CardOption[] = [
  { label: 'Visa',            logo: 'https://cdn.simpleicons.org/visa/1A1F71',              bg: '#1A1F71' },
  { label: 'Mastercard',      logo: 'https://cdn.simpleicons.org/mastercard/EB001B',         bg: '#EB001B' },
  { label: 'American Express',logo: 'https://cdn.simpleicons.org/americanexpress/007BC1',    bg: '#007BC1' },
  { label: 'Diners Club',     logo: 'https://cdn.simpleicons.org/dinersclub/004A97',         bg: '#004A97' },
  { label: 'JCB',             logo: 'https://cdn.simpleicons.org/jcb/003087',               bg: '#003087' },
  { label: 'UnionPay',        logo: 'https://cdn.simpleicons.org/unionpay/D4001A',           bg: '#D4001A' },
  { label: 'PayPal',          logo: 'https://cdn.simpleicons.org/paypal/003087',             bg: '#003087' },
  { label: 'Wire Transfer',   logo: '',                                                      bg: '#374151' },
  { label: 'Check',           logo: '',                                                      bg: '#374151' },
  { label: 'Cash',            logo: '',                                                      bg: '#374151' },
  { label: 'Invoice (30 days)',logo: '',                                                     bg: '#374151' },
];

// ─── Aviation Fuel Cards ──────────────────────────────────────────────────────
export const FUEL_CARDS: CardOption[] = [
  { label: 'Avfuel',              logo: '', bg: '#C8102E' },
  { label: 'Air BP',              logo: 'https://cdn.simpleicons.org/bp/009900',    bg: '#009900' },
  { label: 'Shell Aviation',      logo: 'https://cdn.simpleicons.org/shell/DD1D21', bg: '#DD1D21' },
  { label: 'Phillips 66 Aviation',logo: '', bg: '#E31837' },
  { label: 'Chevron Aviation',    logo: 'https://cdn.simpleicons.org/chevron/005EB8',bg: '#005EB8' },
  { label: 'Exxon Aviation',      logo: 'https://cdn.simpleicons.org/exxon/FF0000', bg: '#FF0000' },
  { label: 'TotalEnergies Aviation',logo:'https://cdn.simpleicons.org/totalenergies/F60028',bg:'#F60028'},
  { label: 'Q8 Aviation',         logo: '', bg: '#0052A5' },
  { label: 'World Fuel Services', logo: '', bg: '#003366' },
  { label: 'Calumet Aviation',    logo: '', bg: '#1B3A6B' },
  { label: 'Phibro Aviation',     logo: '', bg: '#005B8E' },
  { label: 'Signature TailWins',  logo: '', bg: '#E87722' },
  { label: 'Universal Aviation',  logo: '', bg: '#002F6C' },
  { label: 'Texaco Aviation',     logo: '', bg: '#CC0000' },
];

// ─── Service category options ─────────────────────────────────────────────────
export const FBO_SERVICE_CATEGORIES = [
  'Full Service FBO', 'Self-Service Fuel', 'International Services', 'Customs & Immigration',
  'Baggage Handling', 'Aircraft Towing', 'GPU', 'Air Start', 'Lavatory Service',
  'Potable Water', 'Aircraft Cleaning', 'De-icing', 'Hangar Storage', 'Tie-Down',
  'Crew Car', 'Lounge Access', 'Conference Room', 'Crew Hotel Arrangements',
];

export const HANDLER_SERVICE_CATEGORIES = [
  'Full Ground Handling', 'Ramp Handling', 'Passenger Handling', 'Cargo Handling',
  'Aircraft Loading/Unloading', 'Aircraft Marshalling', 'Baggage Handling',
  'Aircraft Towing', 'GPU', 'Air Start', 'Lavatory Service', 'Potable Water',
  'Aircraft Cleaning', 'De-icing', 'Catering Uplift', 'Refueling Coordination',
  'Customs & Immigration Assistance', 'VIP Services', 'Crew Transportation',
];

export const FUEL_SERVICES = [
  'Jet A', 'Jet A-1', 'Avgas 100LL', 'Avgas UL91', 'Jet A with additives',
  'Into-Plane Fueling', 'Truck Fueling', 'Hydrant System', 'SAF Available',
];

export const RAMP_SERVICES = [
  'Aircraft Marshalling', 'Ground Power Unit (GPU)', 'Air Starter', 'Aircraft Towing',
  'Pushback', 'Lavatory Service', 'Potable Water', 'Aircraft Chocking', 'Tire Check',
];

export const PASSENGER_SERVICES = [
  'VIP Lounge', 'Customs Assistance', 'Immigration Assistance', 'Meet & Greet',
  'Baggage Handling', 'Limo / Transportation', 'Hotel Arrangements', 'Catering Coordination',
];

export const CARGO_SERVICES = [
  'Cargo Handling', 'Dangerous Goods', 'Live Animals', 'Perishables',
  'Oversized Cargo', 'Cold Storage', 'Cargo Documentation',
];

export const ADMIN_OPS_SERVICES = [
  'Flight Plan Filing', 'NOTAMs', 'Weather Briefing', 'Permit Assistance',
  'Slot Coordination', 'PPR Coordination', 'Trip Support', 'Overflight Permits',
];

export const LANGUAGES: string[] = [
  'English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Dutch',
  'Russian', 'Arabic', 'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese',
  'Korean', 'Turkish', 'Greek', 'Polish', 'Swedish', 'Norwegian', 'Finnish', 'Danish',
];

export const ACCREDITATIONS: string[] = [
  'IATA', 'ISAGO', 'IS-BAH', 'IS-BAO', 'NATA', 'ASA', 'NBAA',
  'Airport Authority Certified', 'ISO 9001', 'ASQ', 'HACCP',
];

export const OTHER_SERVICES: string[] = [
  'Aircraft Maintenance', 'Aircraft Charter', 'Crew Accommodation',
  'Car Rental Arrangements', 'Security Services', 'Medical Services',
  'Flight Dispatch', 'Weight & Balance', 'Aircraft Leasing',
];
