import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = req.nextUrl;
    const action = url.searchParams.get('action');

    const db = getAdminDb();

    // ── List distinct countries from airports collection ──────────────────────
    if (action === 'countries') {
      const snap = await db.collection('airports').select('country').get();
      const countries = [...new Set(
        snap.docs.map(d => (d.data().country as string | undefined)?.trim()).filter(Boolean)
      )].sort() as string[];
      return NextResponse.json({ countries });
    }

    // ── ICAO or name search ───────────────────────────────────────────────────
    const icaoParam = url.searchParams.get('icao')?.trim().toUpperCase() ?? '';
    const nameParam = url.searchParams.get('name')?.trim() ?? '';
    const typeParam = url.searchParams.get('type') ?? 'all';

    if (icaoParam || nameParam) {
      const invitationSnap = await db.collection('invitations').select('email').get();
      const invitedEmails = new Set(invitationSnap.docs.map(d => (d.data().email as string | undefined)?.toLowerCase()).filter(Boolean));

      const handlerDocs: { id: string; data: Record<string, unknown> }[] = [];
      const fboDocs: { id: string; data: Record<string, unknown> }[] = [];

      if (typeParam !== 'fbo') {
        const q = icaoParam
          ? db.collection('handler').where('handlerIcao', '==', icaoParam)
          : db.collection('handler').where('handlerName', '>=', nameParam).where('handlerName', '<=', nameParam + '');
        const snap = await q.select('handlerName', 'handlerEmail', 'handlerIcao', 'handlerPocName', 'handlerCountry').get();
        snap.docs.forEach(d => handlerDocs.push({ id: d.id, data: d.data() as Record<string, unknown> }));
      }

      if (typeParam !== 'handler') {
        const q = icaoParam
          ? db.collection('fbo').where('fboIcao', '==', icaoParam)
          : db.collection('fbo').where('fboName', '>=', nameParam).where('fboName', '<=', nameParam + '');
        const snap = await q.select('fboName', 'fboEmail', 'fboIcao', 'fboPocName', 'fboCountry').get();
        snap.docs.forEach(d => fboDocs.push({ id: d.id, data: d.data() as Record<string, unknown> }));
      }

      const companies: {
        id: string; companyName: string; companyType: 'fbo' | 'handler';
        icao: string; email: string; pocName: string; country: string; alreadyInvited: boolean;
      }[] = [];

      handlerDocs.forEach(({ id, data }) => {
        const email = (data.handlerEmail as string | undefined)?.trim();
        const name = (data.handlerName as string | undefined)?.trim();
        const icao = (data.handlerIcao as string | undefined)?.trim();
        if (!email || !name || !icao) return;
        companies.push({ id, companyName: name, companyType: 'handler', icao: icao.toUpperCase(), email,
          pocName: (data.handlerPocName as string | undefined)?.trim() ?? '',
          country: (data.handlerCountry as string | undefined)?.trim() ?? '',
          alreadyInvited: invitedEmails.has(email.toLowerCase()) });
      });

      fboDocs.forEach(({ id, data }) => {
        const email = (data.fboEmail as string | undefined)?.trim();
        const name = (data.fboName as string | undefined)?.trim();
        const icao = (data.fboIcao as string | undefined)?.trim();
        if (!email || !name || !icao) return;
        companies.push({ id, companyName: name, companyType: 'fbo', icao: icao.toUpperCase(), email,
          pocName: (data.fboPocName as string | undefined)?.trim() ?? '',
          country: (data.fboCountry as string | undefined)?.trim() ?? '',
          alreadyInvited: invitedEmails.has(email.toLowerCase()) });
      });

      const seen = new Set<string>();
      const unique = companies.filter(c => { const k = c.email.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
      unique.sort((a, b) => a.icao.localeCompare(b.icao) || a.companyName.localeCompare(b.companyName));
      return NextResponse.json({ companies: unique });
    }

    // ── List companies filtered by countries ──────────────────────────────────
    const countriesParam = url.searchParams.get('countries') ?? '';

    if (!countriesParam) {
      return NextResponse.json({ companies: [] });
    }

    const selectedCountries = countriesParam.split(',').map(c => c.trim().toUpperCase());

    // 1. Get all airport ICAOs for the selected countries
    const airportSnaps = await Promise.all(
      selectedCountries.map(country =>
        db.collection('airports')
          .where('country', 'in', [country, ' ' + country, country.toLowerCase(), ' ' + country.toLowerCase()])
          .select('icao', 'country')
          .get()
      )
    );

    // Also try trimmed lowercase match
    const icaoSet = new Set<string>();
    airportSnaps.forEach(snap => {
      snap.docs.forEach(d => {
        const icao = (d.data().icao as string | undefined)?.trim();
        if (icao) icaoSet.add(icao.toUpperCase());
      });
    });

    // Fallback: scan all airports matching by trimmed country name
    if (icaoSet.size === 0) {
      const allAirports = await db.collection('airports').select('icao', 'country').get();
      allAirports.docs.forEach(d => {
        const data = d.data();
        const country = (data.country as string | undefined)?.trim().toUpperCase();
        if (country && selectedCountries.includes(country)) {
          const icao = (data.icao as string | undefined)?.trim();
          if (icao) icaoSet.add(icao.toUpperCase());
        }
      });
    }

    const icaos = [...icaoSet];

    if (icaos.length === 0) {
      return NextResponse.json({ companies: [] });
    }

    // 2. Query handlers and FBOs for those ICAOs in batches of 30 (Firestore limit)
    const BATCH = 30;
    const handlerDocs: { id: string; data: Record<string, unknown> }[] = [];
    const fboDocs: { id: string; data: Record<string, unknown> }[] = [];

    if (typeParam !== 'fbo') {
      for (let i = 0; i < icaos.length; i += BATCH) {
        const batch = icaos.slice(i, i + BATCH);
        const snap = await db.collection('handler')
          .where('handlerIcao', 'in', batch)
          .select('handlerName', 'handlerEmail', 'handlerIcao', 'handlerPocName', 'handlerCountry')
          .get();
        snap.docs.forEach(d => handlerDocs.push({ id: d.id, data: d.data() as Record<string, unknown> }));
      }
    }

    if (typeParam !== 'handler') {
      for (let i = 0; i < icaos.length; i += BATCH) {
        const batch = icaos.slice(i, i + BATCH);
        const snap = await db.collection('fbo')
          .where('fboIcao', 'in', batch)
          .select('fboName', 'fboEmail', 'fboIcao', 'fboPocName', 'fboCountry')
          .get();
        snap.docs.forEach(d => fboDocs.push({ id: d.id, data: d.data() as Record<string, unknown> }));
      }
    }

    // 3. Load already-invited emails
    const invitationSnap = await db.collection('invitations').select('email').get();
    const invitedEmails = new Set(invitationSnap.docs.map(d => (d.data().email as string | undefined)?.toLowerCase()).filter(Boolean));

    // 4. Build response
    const companies: {
      id: string;
      companyName: string;
      companyType: 'fbo' | 'handler';
      icao: string;
      email: string;
      pocName: string;
      country: string;
      alreadyInvited: boolean;
    }[] = [];

    handlerDocs.forEach(({ id, data }) => {
      const email = (data.handlerEmail as string | undefined)?.trim();
      const name = (data.handlerName as string | undefined)?.trim();
      const icao = (data.handlerIcao as string | undefined)?.trim();
      if (!email || !name || !icao) return;
      companies.push({
        id,
        companyName: name,
        companyType: 'handler',
        icao: icao.toUpperCase(),
        email,
        pocName: (data.handlerPocName as string | undefined)?.trim() ?? '',
        country: (data.handlerCountry as string | undefined)?.trim() ?? '',
        alreadyInvited: invitedEmails.has(email.toLowerCase()),
      });
    });

    fboDocs.forEach(({ id, data }) => {
      const email = (data.fboEmail as string | undefined)?.trim();
      const name = (data.fboName as string | undefined)?.trim();
      const icao = (data.fboIcao as string | undefined)?.trim();
      if (!email || !name || !icao) return;
      companies.push({
        id,
        companyName: name,
        companyType: 'fbo',
        icao: icao.toUpperCase(),
        email,
        pocName: (data.fboPocName as string | undefined)?.trim() ?? '',
        country: (data.fboCountry as string | undefined)?.trim() ?? '',
        alreadyInvited: invitedEmails.has(email.toLowerCase()),
      });
    });

    // Deduplicate by email
    const seen = new Set<string>();
    const unique = companies.filter(c => {
      const key = c.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    unique.sort((a, b) => a.icao.localeCompare(b.icao) || a.companyName.localeCompare(b.companyName));

    return NextResponse.json({ companies: unique, icaoCount: icaos.length });
  } catch (err) {
    console.error('bulk-companies error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
