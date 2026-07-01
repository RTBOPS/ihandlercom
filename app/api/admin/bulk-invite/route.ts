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
  const base = 'https://www.i-handler.com';
  const logoUrl = `${base}/images/IHANDLER_LOGO.png`;
  const appLogoUrl = `${base}/images/ihandler-app/app-logo.jpg`;
  const bhsLogoUrl = `${base}/images/bhs/bhs-logo.png`;
  const hrsLogoUrl = `${base}/images/hrs/hrs-logo.jpg`;
  const gtpsLogoUrl = `${base}/images/gtps/gtps-logo.jpg`;

  const credBlock = isExisting
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:2px solid #f34707;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#f34707;letter-spacing:1.5px;text-transform:uppercase;">Your Portal Access</p>
          <p style="margin:0 0 5px 0;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>
          <p style="margin:0;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
        </td></tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f5;border:2px solid #f34707;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;color:#f34707;letter-spacing:1.5px;text-transform:uppercase;">Your Login Credentials</p>
          <p style="margin:0 0 5px 0;font-size:14px;color:#333;"><strong>Portal:</strong> <a href="${loginUrl}" style="color:#f34707;">${loginUrl}</a></p>
          <p style="margin:0 0 5px 0;font-size:14px;color:#333;"><strong>Email:</strong> ${email}</p>
          <p style="margin:0;font-size:14px;color:#333;"><strong>Password:</strong> <span style="font-family:monospace;background:#fff;padding:3px 10px;border-radius:4px;border:1px solid #ddd;font-size:15px;">${tempPassword}</span></p>
        </td></tr>
      </table>
      <p style="font-size:13px;color:#888;margin:0 0 20px 0;">Please log in and change your password after your first access.</p>`;

  const ecosystemSection = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <tr><td style="background:#f9fafb;padding:14px 20px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:1px;">The i-Handler Ecosystem</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Exclusive platform for aviation professionals — connecting crews, passengers and service providers worldwide</p>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="25%" style="text-align:center;padding:8px 4px;vertical-align:top;">
              <a href="${base}" style="text-decoration:none;">
                <img src="${appLogoUrl}" width="52" height="52" alt="i-Handler App" style="border-radius:12px;display:block;margin:0 auto 7px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">i-Handler App</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Flight ops & ground directory</p>
              </a>
            </td>
            <td width="25%" style="text-align:center;padding:8px 4px;vertical-align:top;">
              <a href="${base}/bhs" style="text-decoration:none;">
                <img src="${bhsLogoUrl}" width="52" height="52" alt="BAGControl" style="border-radius:12px;display:block;margin:0 auto 7px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">BAGControl</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Baggage handling & tracking</p>
              </a>
            </td>
            <td width="25%" style="text-align:center;padding:8px 4px;vertical-align:top;">
              <a href="${base}/gtps" style="text-decoration:none;">
                <img src="${gtpsLogoUrl}" width="52" height="52" alt="GTPS" style="border-radius:12px;display:block;margin:0 auto 7px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">GTPS</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Ground turnaround analytics</p>
              </a>
            </td>
            <td width="25%" style="text-align:center;padding:8px 4px;vertical-align:top;">
              <a href="${base}/hrs" style="text-decoration:none;">
                <img src="${hrsLogoUrl}" width="52" height="52" alt="HRS" style="border-radius:12px;display:block;margin:0 auto 7px;object-fit:cover;" />
                <p style="margin:0;font-size:11px;font-weight:700;color:#111827;">HRS</p>
                <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Staff training & compliance</p>
              </a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>`;

  const benefitsSection = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;">Why Being Listed in i-Handler Matters</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;">
            <strong>Direct access from flight crews and operators.</strong> Pilots and dispatchers search for handlers and FBOs by ICAO directly from the i-Handler mobile app and request your services in real time.
          </td></tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;">
            <strong>Exclusive aviation ecosystem.</strong> i-Handler connects crews, passengers, ground handlers, FBOs, and service providers on a single platform built exclusively for aviation — no noise, no irrelevant traffic.
          </td></tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;">
            <strong>Global reach, local impact.</strong> Aviation professionals from over 100 countries use i-Handler daily to plan operations, find ground support, and manage their flights.
          </td></tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#166534;line-height:1.5;">
            <strong>Your data, your control.</strong> Update your profile, services, and contact information at any time through your private portal — no intermediaries.
          </td></tr>
        </table>
      </td></tr>
    </table>`;

  const newBody = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">My name is <strong>Felipe Aguilar</strong> from <strong>i-Handler</strong> — the exclusive digital ecosystem for international private aviation ground operations. We are pleased to inform you that <strong>${companyName}</strong> has been included in our global aviation directory, the reference used by operators, pilots, and flight dispatchers worldwide to find FBOs and ground handlers at airports across the globe.</p>
    <p style="margin:0 0 16px 0;">Your company is listed under ICAO <strong style="color:#f34707;font-size:16px;">${icao}</strong>.</p>

    ${benefitsSection}

    <p style="margin:0 0 12px 0;font-weight:600;color:#111;">Access your private portal to verify and update your listing:</p>
    ${credBlock}

    <p style="margin:0 0 8px 0;font-weight:600;">From your portal you can update:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#555;">
      <li style="margin-bottom:5px;">Company contact information (phone, email, website, address)</li>
      <li style="margin-bottom:5px;">Point of contact details</li>
      <li style="margin-bottom:5px;">Ground handling rates and capabilities</li>
      <li style="margin-bottom:5px;">Car rental options at your airport</li>
      <li style="margin-bottom:5px;">Catering services available</li>
      <li style="margin-bottom:5px;">Nearby hotel recommendations</li>
    </ul>

    ${ecosystemSection}

    <p style="margin:0 0 16px 0;">Thank you for being part of the i-Handler community.</p>`;

  const annualBody = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">We hope the year has been going well for <strong>${companyName}</strong>.</p>
    <p style="margin:0 0 16px 0;">As part of our annual directory maintenance, we kindly ask you to review and update your company's information in the <strong>i-Handler</strong> platform — the exclusive aviation ecosystem where crews, passengers, handlers, and FBOs connect worldwide. Accurate, up-to-date information ensures that pilots and operators request your services directly from our app.</p>

    ${benefitsSection}

    <p style="margin:0 0 12px 0;">Please log in to your portal at <strong>ICAO ${icao}</strong>:</p>
    ${credBlock}

    <p style="margin:0 0 8px 0;font-weight:600;">Fields to review and update:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#555;">
      <li style="margin-bottom:5px;">Contact information (phone, email, website)</li>
      <li style="margin-bottom:5px;">Point of contact name and title</li>
      <li style="margin-bottom:5px;">Ground handling capabilities</li>
      <li style="margin-bottom:5px;">Car rental options near the airport</li>
      <li style="margin-bottom:5px;">Catering services available</li>
      <li style="margin-bottom:5px;">Nearby accommodation / hotels</li>
    </ul>

    ${ecosystemSection}

    <p style="margin:0 0 16px 0;">This process takes only a few minutes, and we greatly appreciate your cooperation in keeping the i-Handler directory accurate and up-to-date.</p>
    <p style="margin:0 0 16px 0;">If you have any questions, please do not hesitate to reach out.</p>`;

  const bodyContent = emailType === 'new' ? newBody : annualBody;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>i-Handler Invitation</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);max-width:600px;">
        <!-- Header: white background so the dark-text logo is visible -->
        <tr><td style="background:#ffffff;padding:28px 32px 20px;text-align:center;border-bottom:4px solid #f34707;">
          <img src="${logoUrl}" alt="i-Handler" width="200" style="display:block;margin:0 auto;max-width:200px;" />
          <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;">Global Aviation Ground Operations Platform</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;font-size:14px;line-height:1.7;color:#374151;">
          ${bodyContent}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Best regards,<br/>
            <strong style="color:#111827;">Felipe Aguilar</strong><br/>
            i-Handler Operations Team<br/>
            <a href="mailto:cto@i-handler.app" style="color:#f34707;">cto@i-handler.app</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${base}" style="color:#f34707;">www.i-handler.com</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <img src="${logoUrl}" alt="i-Handler" width="110" style="display:block;margin:0 auto 10px;opacity:0.55;" />
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            © ${new Date().getFullYear()} i-Handler &nbsp;·&nbsp; Global Aviation Ground Operations Platform<br/>
            You are receiving this email because your company is listed in the i-Handler aviation directory.<br/>
            <a href="mailto:cto@i-handler.app?subject=Unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
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

        // Send email via SendGrid if requested — separate try/catch so account creation
        // is never rolled back just because the email fails
        let emailSent = false;
        let emailError: string | undefined;
        if (sendEmails && process.env.SENDGRID_API_KEY) {
          try {
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
              from: { email: 'cto@i-handler.app', name: 'Felipe Aguilar – i-Handler' },
              subject,
              html,
            });
            emailSent = true;
          } catch (sgErr: unknown) {
            const msg = sgErr instanceof Error ? sgErr.message : String(sgErr);
            emailError = `Email failed: ${msg}`;
            console.error('SendGrid error for', company.email, sgErr);
          }
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
          ...(emailError ? { error: emailError } : {}),
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
