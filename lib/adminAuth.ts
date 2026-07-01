// Client helper: verifies an admin password against the server before granting
// UI access. The real protection is server-side (every /api/admin/* route checks
// ADMIN_SECRET); this makes the admin UI reject wrong passwords instead of opening
// for any text typed.
export async function verifyAdminSecret(secret: string): Promise<boolean> {
  if (!secret) return false;
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'x-admin-secret': secret },
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({ ok: false }));
    return data.ok === true;
  } catch {
    return false;
  }
}
