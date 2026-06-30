import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function generatePassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

function buildHtmlEmail(params: {
  companyName: string;
  icao: string;
  email: string;
  contactName: string;
  tempPassword: string | null;
  isExisting: boolean;
  emailType: 'new' | 'annual';
}): string {
  const { companyName, icao, email, contactName, tempPassword, isExisting, emailType } = params;
  const greeting = contactName ? `Dear ${contactName},` : `Dear ${companyName} Team,`;
  const loginUrl = 'https://www.i-handler.com/portal-login';
  const logoUrl = 'https://www.i-handler.com/images/IHANDLER_LOGO.png';

  const credentialsBlock = isExisting
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:1px solid #f34707;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#f34707;letter-spacing:1px;">YOUR LOGIN</p>
          <p style="margin:0 0 4px 0;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>
          <p style="margin:0;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
        </td></tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:1px solid #f34707;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#f34707;letter-spacing:1px;">YOUR LOGIN CREDENTIALS</p>
          <p style="margin:0 0 4px 0;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>
          <p style="margin:0 0 4px 0;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0;font-size:14px;color:#333;"><strong>Password:</strong> <span style="font-family:monospace;background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #ddd;">${tempPassword}</span></p>
        </td></tr>
      </table>`;

  const bodyContent = emailType === 'new'
    ? `<p style="margin:0 0 16px 0;">${greeting}</p>
       <p style="margin:0 0 16px 0;">We hope this message finds you well.</p>
       <p style="margin:0 0 16px 0;">My name is Felipe Aguilar from <strong>i-Handler</strong>, the leading digital platform for international private aviation operations. We are pleased to inform you that <strong>${companyName}</strong> has been included in our global aviation directory — the reference used by operators, pilots, and dispatchers worldwide to find FBOs and ground handlers at airports around the globe.</p>
       <p style="margin:0 0 16px 0;">Your company is listed under ICAO <strong style="color:#f34707;">${icao}</strong>.</p>
       <p style="margin:0 0 8px 0;">We would like to invite you to access your private portal to verify and update your company information. Keeping your data current ensures that aviation professionals around the world can reach you with accurate contact details.</p>
       ${credentialsBlock}
       ${!isExisting ? `<p style="margin:0 0 16px 0;font-size:13px;color:#666;">Please log in and change your password after your first access.</p>` : ''}
       <p style="margin:0 0 8px 0;font-weight:600;">In your portal you can update:</p>
       <ul style="margin:0 0 16px 0;padding-left:20px;color:#555;">
         <li style="margin-bottom:4px;">Company contact information (phone, email, website, address)</li>
         <li style="margin-bottom:4px;">Point of contact details</li>
         <li style="margin-bottom:4px;">Car rental options at your airport</li>
         <li style="margin-bottom:4px;">Catering services at your airport</li>
         <li style="margin-bottom:4px;">Nearby hotel information</li>
       </ul>
       <p style="margin:0 0 16px 0;">We would also love to schedule a brief call to introduce you to all the features i-Handler offers. Please reply to this email to arrange a convenient time.</p>
       <p style="margin:0 0 16px 0;">Thank you for being part of the i-Handler community.</p>`
    : `<p style="margin:0 0 16px 0;">${greeting}</p>
       <p style="margin:0 0 16px 0;">We hope the year has been going well for <strong>${companyName}</strong>.</p>
       <p style="margin:0 0 16px 0;">As part of our annual directory maintenance, we kindly ask you to review and update your company's information in the <strong>i-Handler</strong> platform. Accurate, up-to-date information ensures that aviation operators worldwide can contact you reliably.</p>
       <p style="margin:0 0 8px 0;">Please log in to your portal:</p>
       ${credentialsBlock}
       <p style="margin:0 0 8px 0;font-weight:600;">Fields to review and update:</p>
       <ul style="margin:0 0 16px 0;padding-left:20px;color:#555;">
         <li style="margin-bottom:4px;">Contact information (phone, email, website)</li>
         <li style="margin-bottom:4px;">Point of contact name and title</li>
         <li style="margin-bottom:4px;">Car rental options near the airport</li>
         <li style="margin-bottom:4px;">Catering services available</li>
         <li style="margin-bottom:4px;">Nearby accommodation / hotels</li>
       </ul>
       <p style="margin:0 0 16px 0;">This process takes only a few minutes, and we greatly appreciate your cooperation in keeping the i-Handler directory accurate and up-to-date.</p>
       <p style="margin:0 0 16px 0;">If you have any questions, please do not hesitate to reach out.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>i-Handler Invitation</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;">
        <!-- Header -->
        <tr><td style="background:#111827;padding:24px 32px;text-align:center;">
          <img src="${logoUrl}" alt="i-Handler" width="180" style="display:block;margin:0 auto;max-width:180px;" />
        </td></tr>
        <!-- Orange accent bar -->
        <tr><td style="background:#f34707;height:4px;"></td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#333;">
          ${bodyContent}
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="margin:0;font-size:14px;color:#555;">
            Best regards,<br/>
            <strong>Felipe Aguilar</strong><br/>
            i-Handler Operations Team<br/>
            <a href="mailto:operations@i-handler.app" style="color:#f34707;">operations@i-handler.app</a> ·
            <a href="https://www.i-handler.com" style="color:#f34707;">www.i-handler.com</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
          <img src="${logoUrl}" alt="i-Handler" width="100" style="display:block;margin:0 auto 12px auto;opacity:0.6;" />
          <p style="margin:0;font-size:11px;color:#999;">
            © ${new Date().getFullYear()} i-Handler · Global Aviation Ground Operations Platform<br/>
            You are receiving this email because your company is listed in the i-Handler aviation directory.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

type CompanyEntry = {
  id: string;
  email: string;
  companyName: string;
  companyType: 'fbo' | 'handler';
  icao: string;
  pocName?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { adminSecret, companies, emailType, sendEmails } = await req.json() as {
      adminSecret: string;
      companies: CompanyEntry[];
      emailType: 'new' | 'annual';
      sendEmails: boolean;
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
      pocName: string;
      tempPassword: string | null;
      isExisting: boolean;
      emailSent: boolean;
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
        }

        // Save link in portalLinks — never touches handler/fbo doc
        const docIdKey = company.companyType === 'fbo' ? 'fboDocId' : 'handlerDocId';
        await adminDb.collection('portalLinks').doc(uid).set({
          companyType: company.companyType,
          [docIdKey]: company.id,
          icao: company.icao.toUpperCase(),
        }, { merge: true });

        // Store invitation record
        await adminDb.collection('invitations').doc(company.email).set({
          email: company.email,
          companyName: company.companyName,
          companyType: company.companyType,
          icao: company.icao.toUpperCase(),
          emailType,
          pocName: company.pocName || '',
          status: 'sent',
          uid,
          isExisting,
          existingDocId: company.id,
          sentAt: FieldValue.serverTimestamp(),
          ...(tempPassword ? { tempPassword } : {}),
        }, { merge: true });

        // Send email via SendGrid if requested
        let emailSent = false;
        if (sendEmails && process.env.SENDGRID_API_KEY) {
          const subject = emailType === 'new'
            ? `i-Handler – Invitation to manage your listing at ${company.icao}`
            : `i-Handler – Annual Directory Update Request for ${company.companyName}`;

          const html = buildHtmlEmail({
            companyName: company.companyName,
            icao: company.icao,
            email: company.email,
            contactName: company.pocName || '',
            tempPassword,
            isExisting,
            emailType,
          });

          await sgMail.send({
            to: company.email,
            from: { email: 'faguilar@i-handler.com', name: 'Felipe Aguilar – i-Handler' },
            subject,
            html,
          });
          emailSent = true;
        }

        results.push({
          email: company.email,
          companyName: company.companyName,
          companyType: company.companyType,
          icao: company.icao,
          pocName: company.pocName || '',
          tempPassword,
          isExisting,
          emailSent,
        });
      } catch (err) {
        results.push({
          email: company.email,
          companyName: company.companyName,
          companyType: company.companyType,
          icao: company.icao,
          pocName: company.pocName || '',
          tempPassword: null,
          isExisting: false,
          emailSent: false,
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
