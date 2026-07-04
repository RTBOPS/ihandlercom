import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { toAppSchema, toPortalSchema, type CompanyKind } from '@/lib/handler-schema';
import sgMail from '@sendgrid/mail';

async function sendProfileUpdateNotification(opts: {
  companyName: string;
  icao: string;
  email: string;
  companyType: string;
}) {
  try {
    if (!process.env.SENDGRID_API_KEY) return;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const now = new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });
    await sgMail.send({
      to: 'cto@i-handler.app',
      from: 'cto@i-handler.app',
      subject: `[i-Handler Portal] Profile updated — ${opts.companyName} (${opts.icao})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#F34707;">Portal Profile Updated</h2>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px 12px;font-weight:bold;background:#f9f9f9;">Company</td><td style="padding:8px 12px;">${opts.companyName}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;background:#f9f9f9;">ICAO</td><td style="padding:8px 12px;font-family:monospace;">${opts.icao}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;background:#f9f9f9;">Email</td><td style="padding:8px 12px;">${opts.email}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;background:#f9f9f9;">Type</td><td style="padding:8px 12px;">${opts.companyType}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;background:#f9f9f9;">Change</td><td style="padding:8px 12px;">Profile information was updated</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;background:#f9f9f9;">Timestamp</td><td style="padding:8px 12px;">${now} UTC</td></tr>
          </table>
          <p style="margin-top:24px;">
            <a href="https://www.i-handler.com/admin/status" style="display:inline-block;padding:10px 20px;background:#F34707;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Status Dashboard</a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('SendGrid notification error (non-fatal):', err);
  }
}

async function findCompanyDoc(uid: string) {
  const db = getAdminDb();
  const linkSnap = await db.collection('portalLinks').doc(uid).get();
  if (!linkSnap.exists) return null;

  const link = linkSnap.data()!;
  const colName = link.companyType === 'fbo' ? 'fbo' : 'handler';
  const docId = link.handlerDocId || link.fboDocId;
  const doc = await db.collection(colName).doc(docId).get();
  if (!doc.exists) return null;

  return { db, colName, companyType: link.companyType as string, docId, doc };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const found = await findCompanyDoc(decoded.uid);

    if (!found) return NextResponse.json({ id: null, _new: true });

    const data = found.doc.data() || {};
    const view = toPortalSchema(data, found.colName as CompanyKind);
    return NextResponse.json({ id: found.docId, ...view });
  } catch (err) {
    console.error('portal/record GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getAdminDb();

    const { recordId, fields } = await req.json() as { recordId: string | null; fields: Record<string, unknown> };

    const BLOCKED = ['accountUid', 'ownerUid', 'createdBy', '_createdBy', '_updatedBy', 'uid', '_new', '_companyType'];
    const safe = Object.fromEntries(
      Object.entries(fields).filter(([k]) => !BLOCKED.includes(k))
    );

    let finalId = recordId;

    if (!recordId) {
      // Brand new company — create doc and save link in portalLinks
      const companyType = fields._companyType as string;
      const colName = companyType === 'fbo' ? 'fbo' : 'handler';
      const icaoField = companyType === 'fbo' ? 'fboIcao' : 'handlerIcao';
      const nameField = companyType === 'fbo' ? 'fboName' : 'handlerName';

      // Store in the app's canonical shape (strings/numbers + app field names).
      const base = toAppSchema(safe, colName as CompanyKind);

      // Pre-generate the doc ref so we can stamp `uid` = document id (the app
      // reads a `uid` field that must equal the document id).
      const ref = db.collection(colName).doc();
      await ref.set({
        ...base,
        [icaoField]: fields[icaoField] || '',
        [nameField]: fields[nameField] || '',
        uid: ref.id,
        _createdBy: { uid, timestamp: new Date().toISOString() },
        _updatedBy: { uid, timestamp: new Date().toISOString() },
        _lastUpdatedAt: FieldValue.serverTimestamp(),
        _lastUpdatedBy: uid,
      });
      finalId = ref.id;

      // Save link in portalLinks — never touches handler/fbo doc
      await db.collection('portalLinks').doc(uid).set({
        companyType,
        [colName === 'fbo' ? 'fboDocId' : 'handlerDocId']: finalId,
        icao: (fields[icaoField] as string || '').toUpperCase(),
      });
    } else {
      const found = await findCompanyDoc(uid);
      const colName = found?.colName ?? 'handler';

      // Convert to the app's canonical shape (strings/numbers + app field names).
      const merged = toAppSchema(safe, colName as CompanyKind);

      merged.uid = recordId;
      merged._updatedBy = { uid, timestamp: new Date().toISOString() };
      merged._lastUpdatedAt = FieldValue.serverTimestamp();
      merged._lastUpdatedBy = uid;
      await db.collection(colName).doc(recordId).update(merged);
    }

    // Send admin notification (non-fatal)
    {
      const authUser = await getAdminAuth().getUser(uid).catch(() => null);
      const email = authUser?.email ?? uid;
      const companyName = (fields.handlerName ?? fields.fboName ?? fields.companyName ?? '') as string;
      const icao = (fields.handlerIcao ?? fields.fboIcao ?? fields.icao ?? '') as string;
      const companyType = (fields._companyType ?? fields.companyType ?? 'handler') as string;
      await sendProfileUpdateNotification({ companyName, icao, email, companyType });
    }

    return NextResponse.json({ ok: true, id: finalId });
  } catch (err) {
    console.error('portal/record POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
