import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 2 MB)' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `logos/${uid}/logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = getAdminStorage().bucket();
    const fileRef = bucket.file(path);
    await fileRef.save(buffer, { contentType: file.type, public: true });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('upload-logo error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
