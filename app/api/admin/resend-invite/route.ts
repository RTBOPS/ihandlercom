import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import sgMail from '@sendgrid/mail';

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, email, companyName, companyType, icao, contactName, emailType } = await req.json();

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Generate new temp password and update Firebase Auth
    const tempPassword = generatePassword();
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: tempPassword });

    // Update invitation record
    await db.collection('invitations').doc(email).set({
      tempPassword,
      resentAt: new Date().toISOString(),
    }, { merge: true });

    // Build and send email
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json({ success: true, tempPassword, emailSent: false, error: 'No SendGrid key' });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const loginUrl = 'https://www.i-handler.com/portal-login';
    const greeting = contactName ? `Dear ${contactName},` : `Dear ${companyName} Team,`;
    const isAnnual = emailType === 'annual';

    const subject = isAnnual
      ? `i-Handler – Annual Directory Update Request for ${companyName}`
      : `i-Handler – Portal Access for ${companyName} at ${icao}`;

    const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

  <!-- Header -->
  <tr><td style="background:#ffffff;border-bottom:4px solid #f34707;padding:28px 40px;text-align:center;">
    <img src="https://www.i-handler.com/images/IHANDLER_LOGO.png" alt="i-Handler" height="40" style="display:block;margin:0 auto 8px;" />
    <p style="margin:0;font-size:11px;font-weight:700;color:#f34707;letter-spacing:2px;text-transform:uppercase;">International Aviation Support</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px 40px;">
    <p style="margin:0 0 16px;font-size:15px;color:#111;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      ${isAnnual
        ? `As part of our annual directory maintenance, we kindly ask you to review and update your company's information in the <strong>i-Handler</strong> platform. Accurate, up-to-date information ensures that aviation operators worldwide can contact you reliably.`
        : `We are sending you updated access credentials for your <strong>i-Handler</strong> portal. Please use the credentials below to log in and verify your company information.`
      }
    </p>

    <!-- Credentials box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:2px solid #f34707;border-radius:8px;margin:20px 0;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#f34707;letter-spacing:1.5px;text-transform:uppercase;">Your Login Credentials</p>
        <p style="margin:0 0 5px;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>
        <p style="margin:0 0 5px;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0;font-size:14px;color:#333;"><strong>Password:</strong> <span style="font-family:monospace;background:#fff;padding:3px 10px;border-radius:4px;border:1px solid #ddd;font-size:15px;">${tempPassword}</span></p>
      </td></tr>
    </table>
    <p style="font-size:13px;color:#888;margin:0 0 20px;">Please log in and change your password after your first access.</p>

    <p style="font-size:14px;color:#374151;margin:0 0 8px;"><strong>From your portal you can update:</strong></p>
    <ul style="font-size:14px;color:#374151;margin:0 0 24px;padding-left:20px;line-height:2;">
      <li>Company contact information (phone, email, website, address)</li>
      <li>Point of contact details</li>
      <li>Ground handling rates and capabilities</li>
      <li>Car rental options, catering services, hotel recommendations</li>
    </ul>

    <p style="font-size:14px;color:#374151;margin:0 0 4px;">Thank you for being part of the i-Handler community.</p>
    <p style="font-size:14px;color:#374151;margin:0;">Warm regards,<br/><strong>Felipe Aguilar</strong><br/>i-Handler Operations Team<br/><a href="mailto:cto@i-handler.app" style="color:#f34707;">cto@i-handler.app</a></p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} i-Handler · International Aviation Support</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

    let emailSent = false;
    let emailError: string | undefined;
    try {
      await sgMail.send({ to: email, from: { email: 'cto@i-handler.app', name: 'Felipe Aguilar – i-Handler' }, subject, html });
      emailSent = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : 'SendGrid error';
    }

    return NextResponse.json({ success: true, tempPassword, emailSent, ...(emailError ? { error: emailError } : {}) });
  } catch (err) {
    console.error('resend-invite error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
