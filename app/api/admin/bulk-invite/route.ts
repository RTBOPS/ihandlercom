import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

type CompanyEntry = {
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  contactName?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, companies, emailType } = await req.json() as {
      adminSecret: string;
      companies: CompanyEntry[];
      emailType: 'new' | 'annual';
    };

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!companies?.length) {
      return NextResponse.json({ error: 'No companies provided' }, { status: 400 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const results: {
      email: string;
      companyName: string;
      companyType: string;
      icao: string;
      contactName: string;
      tempPassword: string | null;
      isExisting: boolean;
      error?: string;
    }[] = [];

    for (const company of companies) {
      try {
        let uid: string;
        let isExisting = false;
        let tempPassword: string | null = null;

        try {
          const existing = await adminAuth.getUserByEmail(company.email);
          uid = existing.uid;
          isExisting = true;
        } catch {
          tempPassword = generatePassword();
          const newUser = await adminAuth.createUser({
            email: company.email,
            password: tempPassword,
            displayName: company.companyName,
          });
          uid = newUser.uid;

          await adminDb.collection('users').doc(uid).set({
            email: company.email,
            companyName: company.companyName,
            companyType: company.companyType,
            icao: company.icao.toUpperCase(),
            role: 'owner',
            status: 'approved',
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        await adminDb.collection('invitations').doc(company.email).set({
          email: company.email,
          companyName: company.companyName,
          companyType: company.companyType,
          icao: company.icao.toUpperCase(),
          emailType,
          contactName: company.contactName || '',
          status: 'sent',
          uid,
          isExisting,
          sentAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        results.push({
          email: company.email,
          companyName: company.companyName,
          companyType: company.companyType,
          icao: company.icao,
          contactName: company.contactName || '',
          tempPassword,
          isExisting,
        });
      } catch (err) {
        results.push({
          email: company.email,
          companyName: company.companyName,
          companyType: company.companyType,
          icao: company.icao,
          contactName: company.contactName || '',
          tempPassword: null,
          isExisting: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('bulk-invite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
