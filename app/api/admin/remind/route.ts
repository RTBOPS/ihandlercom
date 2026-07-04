import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

// Follow-up reminder for invited companies that never signed in.
// POST { adminSecret, dryRun: true }        → list of eligible candidates
// POST { adminSecret, emails: [...] }       → send reminders (max 25 per call)
// Eligible: has Auth account, never signed in, email not bounced/spam,
// not already reminded. Each send resets a fresh temp password (safe —
// the account has never been used).

const MAX_PER_CALL = 25;

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

function isBad(ev?: Record<string, string>): boolean {
  return !!(ev && (ev.bounce || ev.dropped || ev.spamreport));
}

function buildReminderEmail(params: {
  companyName: string; icao: string; email: string; contactName: string; tempPassword: string;
}): string {
  const { companyName, icao, email, contactName, tempPassword } = params;
  const greeting = contactName ? `Dear ${contactName},` : `Dear ${companyName} Team,`;
  const loginUrl = 'https://www.i-handler.com/portal-login';
  return `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;max-width:600px;">

  <tr><td style="background:#ffffff;border-bottom:4px solid #f34707;padding:28px 40px;text-align:center;">
    <img src="https://www.i-handler.com/images/IHANDLER_LOGO.png" alt="i-Handler" height="40" style="display:block;margin:0 auto 8px;" />
    <p style="margin:0;font-size:11px;font-weight:700;color:#f34707;letter-spacing:2px;text-transform:uppercase;">International Aviation Support</p>
  </td></tr>

  <tr><td style="padding:32px 40px;">
    <p style="margin:0 0 16px;font-size:15px;color:#111;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      A few days ago we sent you access to your <strong>i-Handler</strong> portal, where you manage how
      <strong>${companyName}</strong> appears to pilots and operators searching <strong>${icao}</strong> worldwide.
      We noticed you haven't had a chance to log in yet, so here are fresh credentials — it only takes a few minutes
      to verify your listing:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:2px solid #f34707;border-radius:8px;margin:20px 0;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#f34707;letter-spacing:1.5px;text-transform:uppercase;">Your Login Credentials</p>
        <p style="margin:0 0 5px;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>
        <p style="margin:0 0 5px;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0;font-size:14px;color:#333;"><strong>Password:</strong> <span style="font-family:monospace;background:#fff;padding:3px 10px;border-radius:4px;border:1px solid #ddd;font-size:15px;">${tempPassword}</span></p>
      </td></tr>
    </table>
    <p style="font-size:13px;color:#888;margin:0 0 20px;">Please log in and change your password after your first access.</p>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      An up-to-date listing means flight crews can reach you directly for handling requests. If you have any
      trouble accessing your portal, just reply to this email and we will help right away.
    </p>

    <p style="font-size:14px;color:#374151;margin:0;">Best regards,<br/><strong>Felipe Aguilar</strong><br/>i-Handler Operations Team<br/><a href="mailto:cto@i-handler.app" style="color:#f34707;">cto@i-handler.app</a></p>
  </td></tr>

  <tr><td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} i-Handler · International Aviation Support<br/>
    <a href="mailto:cto@i-handler.app?subject=Unsubscribe" style="color:#9ca3af;">Unsubscribe</a></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, dryRun, emails } = await req.json() as {
      adminSecret: string; dryRun?: boolean; emails?: string[];
    };

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    if (dryRun) {
      // Full scan: all invitations + Auth lookup in chunks of 100
      const snap = await db.collection('invitations').get();
      const invByEmail = new Map<string, FirebaseFirestore.DocumentData>();
      snap.docs.forEach((d) => invByEmail.set(d.id.toLowerCase(), d.data()));

      const allEmails = [...invByEmail.keys()];
      const authInfo = new Map<string, { lastSignIn: string | null }>();
      for (let i = 0; i < allEmails.length; i += 100) {
        const chunk = allEmails.slice(i, i + 100);
        const result = await auth.getUsers(chunk.map((email) => ({ email })));
        result.users.forEach((u) => {
          if (u.email) authInfo.set(u.email.toLowerCase(), { lastSignIn: u.metadata.lastSignInTime || null });
        });
      }

      const candidates = allEmails
        .filter((email) => {
          const inv = invByEmail.get(email)!;
          const info = authInfo.get(email);
          if (!info) return false;
          if (info.lastSignIn) return false;
          if (isBad(inv.emailEvents)) return false;
          if (inv.remindedAt) return false;
          return true;
        })
        .map((email) => {
          const inv = invByEmail.get(email)!;
          return {
            email,
            companyName: inv.companyName || '',
            companyType: inv.companyType || 'handler',
            icao: (inv.icao || '').toUpperCase(),
          };
        });
      return NextResponse.json({ candidates });
    }

    if (!emails?.length) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
    }
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({ error: 'SendGrid not configured' }, { status: 500 });
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const batch = emails.map((e) => e.trim().toLowerCase()).slice(0, MAX_PER_CALL);
    const results: { email: string; sent: boolean; error?: string }[] = [];

    for (const email of batch) {
      try {
        // Per-email eligibility check — no full-collection scan on the send path
        const invSnap = await db.collection('invitations').doc(email).get();
        const inv = invSnap.data();
        if (!inv || isBad(inv.emailEvents) || inv.remindedAt) {
          results.push({ email, sent: false, error: 'Not eligible (bounced or already reminded)' });
          continue;
        }
        let user;
        try {
          user = await auth.getUserByEmail(email);
        } catch {
          results.push({ email, sent: false, error: 'No account' });
          continue;
        }
        if (user.metadata.lastSignInTime) {
          results.push({ email, sent: false, error: 'Already signed in' });
          continue;
        }
        const tempPassword = generatePassword();
        await auth.updateUser(user.uid, { password: tempPassword });

        await sgMail.send({
          to: email,
          from: { email: 'cto@i-handler.app', name: 'Felipe Aguilar – i-Handler' },
          subject: `Reminder: your i-Handler portal access for ${(inv.icao || '').toUpperCase()}`,
          html: buildReminderEmail({
            companyName: inv.companyName || '',
            icao: (inv.icao || '').toUpperCase(),
            email,
            contactName: inv.contactName || inv.pocName || '',
            tempPassword,
          }),
        });

        await db.collection('invitations').doc(email).set({
          tempPassword,
          remindedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        results.push({ email, sent: true });
      } catch (err) {
        results.push({ email, sent: false, error: err instanceof Error ? err.message : 'Send failed' });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('remind error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
