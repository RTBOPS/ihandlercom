// ─────────────────────────────────────────────────────────────────────────────
// Handler / FBO schema adapter — bridges the PORTAL/website shape (multi-select
// arrays, text frequency, newer field names) and the LIVE mobile app shape
// (comma-joined strings, numeric frequency, older field names incl. the app's
// original misspellings). The mobile app (FlutterFlow) is strongly typed: a field
// that receives the wrong type (an Array where a String is expected, or a String
// where a Number is expected) fails to parse and the WHOLE document is silently
// dropped from the app's list — which is why a portal-created company shows on
// i-handler.com but NOT in i-handler.app.
//
// Canonical stored schema = the APP's shape (LIVE on the App Store, cannot change
// casually). The portal and public directory — our own code — adapt to it here.
// Confirmed against working docs: TECNOLOGIAS UNIDAS S.A. (handler) and
// BORYSPIL GEN AVN (fbo), both of which render in i-handler.com AND i-handler.app.
// ─────────────────────────────────────────────────────────────────────────────

export type CompanyKind = 'handler' | 'fbo';

interface SchemaConfig {
  /** Portal multi-select fields (string[]) stored by the app as comma-joined strings. */
  arrays: readonly string[];
  /** Fields the app stores as a Number — must be written as number|null, never string. */
  numbers: readonly string[];
  /** Portal field name → exact field name the LIVE app reads (incl. app misspellings). */
  renames: Record<string, string>;
}

const HANDLER: SchemaConfig = {
  arrays: [
    'handlerSvcsCategories', 'handlerFuelServices', 'handlerRampServices',
    'handlerPassengersService', 'handlerCargoServices', 'handlerAdminOpsSvcs',
    'handlerOtherServices', 'handlerPaymentForms', 'handlerFuelCards',
    'handlerLanguageSpoken', 'handlerAccreditations',
  ],
  numbers: ['handlerFrequency'],
  renames: {
    handlerTollFreePhone: 'handlerTollfreePhone',
    handlerFrecuency: 'handlerFrequency',
    handlerPassengersService: 'handlerPassengersServices',
    handlerLanguageSpoken: 'handlerLenguageSpoken',
  },
};

const FBO: SchemaConfig = {
  arrays: [
    'fboServiceCategories', 'fboFuelServices', 'fboRampServices',
    'fboPassengerService', 'fboCargoServices', 'fboAdministrationOpsSvcs',
    'fboOtherServices', 'fboPaymentForms', 'fboFuelCards',
    'fboLanguageSpoken', 'fboAccreditations',
  ],
  numbers: ['fboFrequency'],
  renames: {
    // NOTE: fboPhne and fboTollFreePhone already match the app — do NOT rename them.
    fboFrecuency: 'fboFrequency',
    fboPassengerService: 'fboPassengersServices',
    fboLanguageSpoken: 'fboLenguageSpoken',
  },
};

const cfg = (kind: CompanyKind): SchemaConfig => (kind === 'fbo' ? FBO : HANDLER);
const invert = (m: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));

const SEP = ', ';

/** Coerce any array | comma-string | undefined into a clean string[] (for display). */
export function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Parse a free-text frequency ("131.78", "130.250 MHz") to a number, else null. */
function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Portal shape (arrays + portal names + text) → app shape (strings/numbers + app names).
 *  Used when WRITING a company document. */
export function toAppSchema(fields: Record<string, unknown>, kind: CompanyKind = 'handler'): Record<string, unknown> {
  const { numbers, renames } = cfg(kind);
  const numSet = new Set(numbers);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    const key = renames[k] ?? k;
    if (numSet.has(key)) {
      out[key] = toNumberOrNull(v);
    } else if (Array.isArray(v)) {
      out[key] = (v as unknown[]).filter(Boolean).map(String).join(SEP);
    } else {
      out[key] = v;
    }
  }
  return out;
}

/** App shape (strings/numbers + app names) → portal shape (arrays + portal names + text).
 *  Used when READING a company document back into the portal form. */
export function toPortalSchema(data: Record<string, unknown>, kind: CompanyKind = 'handler'): Record<string, unknown> {
  const { arrays, numbers, renames } = cfg(kind);
  const appToPortal = invert(renames);
  const out: Record<string, unknown> = { ...data };

  // Expose app-named fields under the portal names the form expects.
  for (const [appKey, portalKey] of Object.entries(appToPortal)) {
    if (appKey in out) out[portalKey] = out[appKey];
  }
  // Split multi-select fields back into arrays for the TagSelect components.
  for (const key of arrays) {
    if (typeof out[key] === 'string') out[key] = asList(out[key]);
  }
  // Numeric fields back to strings for the text <input>.
  for (const appKey of numbers) {
    const portalKey = appToPortal[appKey] ?? appKey;
    if (typeof out[portalKey] === 'number') out[portalKey] = String(out[portalKey]);
    if (typeof out[appKey] === 'number') out[appKey] = String(out[appKey]);
  }
  return out;
}
