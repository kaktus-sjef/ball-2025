import { NextResponse } from 'next/server';
import { bucket } from '@/lib/storage';
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const original = formData.get('original');
    const preview = formData.get('preview');

    if (!original || typeof original === 'string' || !preview || typeof preview === 'string') {
      return NextResponse.json({ error: 'Ugyldige filer' }, { status: 400 });
    }

    const uploadFile = async (file, pathPrefix) => {
      const generateUniqueName = (originalName) => {
        const ext = originalName.split('.').pop();
        const base = originalName.replace(/\.[^/.]+$/, '');
        const unique = `${base}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return `${unique}.${ext}`;
      };
      const filename = `${pathPrefix}/${generateUniqueName(file.name)}`;      
      const blob = bucket.file(filename);
      const writeStream = blob.createWriteStream({
        metadata: { contentType: file.type },
        resumable: false,
      });

      const reader = file.stream().getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          writeStream.write(value);
        }
        writeStream.end();
      };

      await pump();
      return `https://storage.googleapis.com/${bucket.name}/${filename}`;
    };

    const originalUrl = await uploadFile(original, 'originals');
    const previewUrl = await uploadFile(preview, 'previews');

    await addDoc(collection(db, 'images'), {
      url: previewUrl,
      originalUrl,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ previewUrl, originalUrl });
  } catch (err) {
    console.error('Feil ved opplasting:', err);
    return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
  }
}
