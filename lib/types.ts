export interface AirportRecord {
  id: string;
  name: string;
  iata: string;
  icao: string;
  latitude?: number;
  longitud?: number;
  elevationFt?: string;
  longestHardSurfaceRwy?: string;
  runwaySurface?: string;
  pcn?: string;
  approaches?: string;
  fuelAvailable?: string;
  slotRequired?: string;
  aptType?: string;
  airportOfEntry?: string;
  fireCategory?: string;
  customs?: string;
  handlingMandatory?: string;
  aptLightIntensity?: string;
  open24Hours?: string;
  controlTowerHours?: string;
  sunrise?: string;
  sunset?: string;
  airportEmail?: string;
  airportWebsite?: string;
  aipWeb?: string;
  airportGeneralRemarks?: string;
  airportDistanceFromCity?: string;
  airportHours?: string;
  airportOfEntryRemarks?: string;
  // Extra fields present in Firestore but not in original schema
  airportDiagram?: string;
  faa?: string;
  locatedIn?: string;
  country?: string;
  sita?: string;
  dst?: string;
  variation?: string;
  // Authority (typo variant used in Firestore)
  airportAutorityPhone?: string;
  airportAutorityFrequency?: string;
  airportManagerFrequency?: string;
  airportOperationsFrequency?: string;
  airportInformationFrequency?: string;
  airportAdminFrequency?: string;
  // Tower
  towerPhone?: string;
  towerFax?: string;
  towerEmail?: string;
  towerWebsite?: string;
  towerFrequency?: string;
  // Customs & Immigration
  customsPhone?: string;
  customsFax?: string;
  customsEmail?: string;
  customsWebsite?: string;
  immigrationPhpne?: string;
  immigrationFax?: string;
  immigrationEmail?: string;
  immigrationWebsite?: string;
  usCustomsClereance?: string;
  // PPR & Slot
  pprPhone?: string;
  pprFax?: string;
  pprEmail?: string;
  pprWebsite?: string;
  pprFrequency?: string;
  slotRequestPhpne?: string;
  slotRequestFax?: string;
  slotRequestEmail?: string;
  slotRequestWebsite?: string;
  slotRequestFrequency?: string;
  // Flight plan
  flightPlanPhone?: string;
  flightPlanEmail?: string;
  flightPlanWebsite?: string;
  flightPanWebsite?: string;
  flightPlanFrequency?: string;
  // MET
  metPhone?: string;
  metFax?: string;
  metEmail?: string;
  metWebsite?: string;
  metFrequcny?: string;
  // CAA
  caaPhone?: string;
  caaFax?: string;
  caaEmail?: string;
  caaWebsite?: string;
  // DSA
  dsaPhone?: string;
  dsaFax?: string;
  dsaEmail?: string;
  dsaWebsite?: string;
  // Military
  militaryBasePhone?: string;
  militaryBaseFax?: string;
  militaryBaseEmail?: string;
  militaryBaseWebsite?: string;
  // Austro Control
  austroControlPhone?: string;
  austroControlFax?: string;
  austroControlEmail?: string;
  austroControlWebsite?: string;
  // Frequencies
  atcFrequency?: string;
  atisFrequency?: string;
  atsFrequency?: string;
  aisFrequency?: string;
  airportInformationFreq?: string;
  airportAutorityFreq?: string;
  ctafFrequency?: string;
  unicomFrequency?: string;
  lightsFrequency?: string;
  afsAftn?: string;
  // Admin contacts
  airportAdminEmail?: string;
  airportAdminPhone?: string;
  airportAdminFax?: string;
  airportAdminWebsite?: string;
  airportAuthorityEmail?: string;
  airportAuthorityPhone?: string;
  airportAuthorityFax?: string;
  airportAuthorityWebsite?: string;
  airportManagerEmail?: string;
  airportManagerPhone?: string;
  airportManagerFax?: string;
  airportManagerWebsite?: string;
  airportOperationsEmail?: string;
  airportOperationsPhpne?: string;
  airportOperationsFax?: string;
  airportOperationsWebsite?: string;
  airportInfoEmail?: string;
  airportInfoPhone?: string;
  airportInformationFax?: string;
  airportInformationWebsite?: string;
  // ATC/AIS/ATIS contacts
  atcEmail?: string;
  atcPhone?: string;
  atcFax?: string;
  atcWebsite?: string;
  atisEmail?: string;
  atisPhone?: string;
  atisFax?: string;
  atisWebsite?: string;
  atsEmail?: string;
  atsPhone?: string;
  atsFax?: string;
  atsWebsite?: string;
  aisEmail?: string;
  aisPhone?: string;
  aisFax?: string;
  aisWebsite?: string;
  aroEmail?: string;
  aroPhone?: string;
  aroFax?: string;
  aroWebsite?: string;
  asfAftn?: string;
}

export interface HandlerRecord {
  id: string;
  handlerName: string;
  handlerIcao?: string;
  handlerfaa?: string;
  handlerCity?: string;
  handlerState?: string;
  handlerCountry?: string;
  handlerZipcode?: string;
  handlerAddress?: string;
  handlerPhone?: string;
  handlerAfterHoursPhone?: string;
  handlerTollFreePhone?: string;
  handlerEmail?: string;
  handlerWebsite?: string;
  handlerFax?: string;
  handlerAftn?: string;
  handlerSita?: string;
  handlerLogoImage?: string;
  handlerPoc?: string;
  handlerPocTitle?: string;
  handlerPocMobile?: string;
  handlerRemarks?: string;
  handlerAccreditations?: string[];
  handlerWhatsapp?: string;
  handlerLinkedin?: string;
  handlerFacebook?: string;
  handlerFrecuency?: string;
  handlerBusinessGenAviationScvs?: string[];
  handlerCargoServices?: string[];
  handlerFuelServices?: string[];
  handlerAdminOpsSvcs?: string[];
  handlerRampServices?: string[];
  handlerSvcsCategories?: string[];
  handlerFuelCards?: string[];
  handlerPassengersService?: string[];
  handlerPaymentForms?: string[];
  handlerLanguageSpoken?: string[];
  handlerOtherServices?: string[];
  handlerQuoteService?: string;
  handlerQuotePrice?: number;
  uid?: string;
}

export interface CarRentalRecord {
  id: string;
  icao: string;
  companyName: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  poc?: string;
  whatsapp?: string;
  remarks?: string;
  updatedBy?: string;
  updatedAt?: unknown;
}

export interface CateringRecord {
  id: string;
  icao: string;
  companyName: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  poc?: string;
  whatsapp?: string;
  cuisineType?: string;
  remarks?: string;
  updatedBy?: string;
  updatedAt?: unknown;
}

export interface HotelRecord {
  id: string;
  icao: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  stars?: string;
  distanceFromAirport?: string;
  shuttle?: string;
  remarks?: string;
  updatedBy?: string;
  updatedAt?: unknown;
}

export interface InvitationRecord {
  id: string;
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  emailType: 'new' | 'annual';
  contactName?: string;
  status: string;
  uid?: string;
  isExisting?: boolean;
  sentAt?: unknown;
}

export interface FboRecord {
  id: string;
  fboName: string;
  fboIcao?: string;
  fboFaa?: string;
  fboCity?: string;
  fboState?: string;
  fboCountry?: string;
  fboZipcode?: string;
  fboAddress?: string;
  fboPhne?: string;
  fboAfterHoursPhone?: string;
  fboTollFreePhone?: string;
  fboEmail?: string;
  fboFax?: string;
  fboWebsite?: string;
  fboAftn?: string;
  fboSita?: string;
  fboLogo?: string;
  fboPocName?: string;
  fboPocTitle?: string;
  fboPocMobile?: string;
  fboRemarks?: string;
  fboAccreditations?: string[];
  fboWhatsapp?: string;
  fboLinkedin?: string;
  fboFacebook?: string;
  fboFrecuency?: string;
  fboMembership?: string;
  fboAdministrationOpsSvcs?: string[];
  fboBusinessGenSvcs?: string[];
  fboCargoServices?: string[];
  fboFuelServices?: string[];
  fboRampServices?: string[];
  fboServiceCategories?: string[];
  fboFuelCards?: string[];
  fboPaymentForms?: string[];
  fboLanguageSpoken?: string[];
  fboPassengerService?: string[];
  fboOtherServices?: string[];
  uid?: string;
}
