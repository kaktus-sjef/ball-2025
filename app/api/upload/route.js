import { NextResponse } from 'next/server';
import { bucket } from '@/lib/storage';
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.log('Ingen fil funnet i request');
      return NextResponse.json({ error: 'Ingen fil sendt' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name;

    const blob = bucket.file(filename);

    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    await addDoc(collection(db, 'images'), {
      url: publicUrl,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('Feil i route handler:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
