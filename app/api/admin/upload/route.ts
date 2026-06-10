import { NextRequest, NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'admin-uploads';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = getStorage(getAdminApp()).bucket('facturacionihandler.appspot.com');
    const ext = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/facturacionihandler.appspot.com/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
