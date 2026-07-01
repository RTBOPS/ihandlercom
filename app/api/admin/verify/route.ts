import { NextRequest, NextResponse } from 'next/server';

// Validates the admin password against ADMIN_SECRET (server-side only — the value
// never reaches the client). Returns { ok } so the admin UI can gate access.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  const expected = process.env.ADMIN_SECRET;
  const ok = !!expected && !!secret && secret === expected;
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
