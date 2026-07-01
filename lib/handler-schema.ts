// ─────────────────────────────────────────────────────────────────────────────
// Handler schema adapter — bridges the PORTAL/website shape (multi-select arrays,
// newer field names) and the LIVE mobile app shape (comma-joined strings, older
// field names, incl. the app's original misspellings). The mobile app (FlutterFlow)
// is strongly typed: a String field that receives an Array fails to parse and the
// whole document is silently dropped from the app's list — which is exactly why a
// portal-created handler shows on i-handler.com but NOT in i-handler.app.
//
// Canonical stored schema = the APP's shape (it's LIVE on the App Store and cannot
// be changed casually). The portal and the public directory — both our own code —
// adapt to it through the helpers below. HANDLERS ONLY for now; FBO needs its own
// reference document before applying the same mapping.
// ─────────────────────────────────────────────────────────────────────────────

/** Portal multi-select fields (edited as string[]) that the app stores as a
 *  comma-joined string. Joined on write, split back to an array on read. */
export const HANDLER_ARRAY_FIELDS = [
  'handlerSvcsCategories',
  'handlerFuelServices',
  'handlerRampServices',
  'handlerPassengersService',
  'handlerCargoServices',
  'handlerAdminOpsSvcs',
  'handlerOtherServices',
  'handlerPaymentForms',
  'handlerFuelCards',
  'handlerLanguageSpoken',
  'handlerAccreditations',
] as const;

/** Portal field name → exact field name the LIVE app reads (incl. the app's
 *  original spellings). Confirmed against a working handler doc (TECNOLOGIAS
 *  UNIDAS S.A.), which renders in both i-handler.com and i-handler.app. */
export const PORTAL_TO_APP: Record<string, string> = {
  handlerTollFreePhone: 'handlerTollfreePhone',
  handlerFrecuency: 'handlerFrequency',
  handlerPassengersService: 'handlerPassengersServices',
  handlerLanguageSpoken: 'handlerLenguageSpoken',
};

export const APP_TO_PORTAL: Record<string, string> = Object.fromEntries(
  Object.entries(PORTAL_TO_APP).map(([portal, app]) => [app, portal]),
);

const SEP = ', ';

/** Coerce any array | comma-string | undefined into a clean string[] (for display). */
export function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/** Portal shape (arrays + portal names) → app shape (strings + app names).
 *  Used when WRITING a handler document. */
export function toAppSchema(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    const key = PORTAL_TO_APP[k] ?? k;
    out[key] = Array.isArray(v) ? (v as unknown[]).filter(Boolean).map(String).join(SEP) : v;
  }
  return out;
}

/** App shape (strings + app names) → portal shape (arrays + portal names).
 *  Used when READING a handler document back into the portal form. */
export function toPortalSchema(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };
  // Expose app-named fields under the portal names the form expects.
  for (const [appKey, portalKey] of Object.entries(APP_TO_PORTAL)) {
    if (appKey in out) out[portalKey] = out[appKey];
  }
  // Split multi-select fields back into arrays for the TagSelect components.
  for (const key of HANDLER_ARRAY_FIELDS) {
    if (typeof out[key] === 'string') out[key] = asList(out[key]);
  }
  return out;
}
