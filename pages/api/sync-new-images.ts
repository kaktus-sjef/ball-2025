import { NextApiRequest, NextApiResponse } from 'next';
import { bucket } from '@/lib/storage';
import { db, collection, addDoc, serverTimestamp, getDocs } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const originals = (await bucket.getFiles({ prefix: 'originals/' }))[0];

    // Hent allerede lagrede originalUrl-er for å unngå duplikat
    const snapshot = await getDocs(collection(db, 'images'));
    const existingOriginals = new Set(snapshot.docs.map(doc => doc.data().originalUrl));

    const newFiles = originals.filter(file => {
      const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      return !existingOriginals.has(url);
    });

    let synced = 0;

    for (const file of newFiles) {
      try {
        const [data] = await file.download();
        console.log('🔍 Filnavn:', file.name);

        const extension = file.name.split('.').pop()?.toLowerCase();

        // Bare behandl kjente bildeformater
        if (!['jpg', 'jpeg', 'png'].includes(extension || '')) {
          console.warn(`⏭️ Hopper over unsupported filtype: ${file.name}`);
          continue;
        }

        const image = sharp(data).rotate(); // forsøk å bruke EXIF først
        const metadata = await image.metadata();

        // Hvis det ikke finnes orientering, men bildet er "liggende" → roter manuelt
        if (!metadata.orientation && metadata.width && metadata.width > metadata.height) {
        image.rotate(90); // tving rotering til stående
        }

        const compressedBuffer = await image
        .resize({ width: 1200 })
        .jpeg({ quality: 70 })
        .toBuffer();

        const previewName = file.name.replace('originals/', '');
        const previewPath = `previews/${uuidv4()}_${previewName}`;
        const previewFile = bucket.file(previewPath);
        await previewFile.save(compressedBuffer, {
          metadata: { contentType: 'image/jpeg' },
        });

        const previewUrl = `https://storage.googleapis.com/${bucket.name}/${previewPath}`;
        const originalUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

        await addDoc(collection(db, 'images'), {
          previewUrl,
          originalUrl,
          createdAt: serverTimestamp(),
        });

        synced++;
      } catch (err) {
        console.error(`❌ Feil ved behandling av ${file.name}:`, err);
      }
    }

    return res.status(200).json({ message: `Sync fullført (${synced} nye bilder)` });
  } catch (err) {
    console.error('Feil i sync:', err);
    return res.status(500).json({ error: 'Intern feil ved sync' });
  }
}
