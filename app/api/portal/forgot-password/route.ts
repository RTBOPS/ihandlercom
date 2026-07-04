import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

// Public endpoint: always answers { success: true } so callers cannot probe
// which emails have accounts. Rate-limited per email to prevent abuse.
const RATE_LIMIT_MS = 5 * 60 * 1000;

function buildResetEmail(resetLink: string, email: string): string {
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
    <p style="margin:0 0 16px;font-size:15px;color:#111;">Hello,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      We received a request to reset the password for your <strong>i-Handler</strong> portal account (<strong>${email}</strong>).
      Click the button below to choose a new password:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${resetLink}" style="display:inline-block;background:#f34707;color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">Reset My Password</a>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#888;margin:0 0 8px;">After setting your new password, sign in at:</p>
    <p style="font-size:13px;margin:0 0 20px;"><a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>

    <p style="font-size:13px;color:#888;margin:0 0 20px;">If you did not request this, you can safely ignore this email — your password will not change.</p>

    <p style="font-size:14px;color:#374151;margin:0;">Best regards,<br/><strong>Felipe Aguilar</strong><br/>i-Handler Operations Team<br/><a href="mailto:cto@i-handler.app" style="color:#f34707;">cto@i-handler.app</a></p>
  </td></tr>

  <tr><td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} i-Handler · International Aviation Support</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };
    const normalized = (email || '').trim().toLowerCase();

    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const genericOk = NextResponse.json({ success: true });

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Rate limit per email — respond generically either way
    const rlRef = db.collection('passwordResets').doc(normalized);
    const rlSnap = await rlRef.get();
    const lastSentAt = rlSnap.exists ? rlSnap.data()?.lastSentAt?.toDate?.()?.getTime() : null;
    if (lastSentAt && Date.now() - lastSentAt < RATE_LIMIT_MS) {
      return genericOk;
    }

    try {
      await auth.getUserByEmail(normalized);
    } catch {
      // No account — same generic response, no email
      return genericOk;
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.error('forgot-password: SENDGRID_API_KEY not configured');
      return genericOk;
    }

    const resetLink = await auth.generatePasswordResetLink(normalized, {
      url: 'https://www.i-handler.com/portal-login',
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: normalized,
      from: { email: 'cto@i-handler.app', name: 'i-Handler Support' },
      subject: 'i-Handler – Reset your portal password',
      html: buildResetEmail(resetLink, normalized),
    });

    await rlRef.set({
      lastSentAt: FieldValue.serverTimestamp(),
      count: FieldValue.increment(1),
    }, { merge: true });

    return genericOk;
  } catch (err) {
    console.error('forgot-password error:', err);
    // Still generic — never expose internals on a public endpoint
    return NextResponse.json({ success: true });
  }
}
