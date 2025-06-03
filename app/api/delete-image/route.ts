import { NextResponse } from 'next/server';
import { db, doc, deleteDoc } from '@/lib/firebase';
import { bucket } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const { url, id } = await req.json();
    if (!url || !id) throw new Error('Ugyldig forespørsel');

    const path = decodeURIComponent(new URL(url).pathname.split('/').slice(2).join('/'));
    const file = bucket.file(path);

    await file.delete();
    await deleteDoc(doc(db, 'images', id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Feil ved sletting:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
