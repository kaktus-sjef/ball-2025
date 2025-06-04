import { NextApiRequest, NextApiResponse } from 'next';
import { bucket } from '@/lib/storage';
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';
import Busboy from 'busboy'; // ✅ Bruk moderne import

export const config = {
  api: {
    bodyParser: false, // viktig for store filer
  },
};

type Upload = {
  fieldname: string;
  data: Buffer;
  mime: string;
  filename: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const bb = Busboy({ headers: req.headers });
    const uploads: Upload[] = [];

    bb.on(
      'file',
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        filename: string,
        encoding: string, // 👈 Trengs pga type-signatur
        mimetype: string
      ) => {
        const buffers: Buffer[] = [];
        file.on('data', (data: Buffer) => buffers.push(data));
        file.on('end', () => {
          uploads.push({
            fieldname,
            data: Buffer.concat(buffers),
            mime: mimetype,
            filename,
          });
        });
      }
    );

    bb.on('finish', async () => {
      const result: Record<string, string> = {}; // ✅ Ikke bruk `any`

      for (const upload of uploads) {
        const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${upload.filename}`;
        const path = upload.fieldname === 'original' ? 'originals' : 'previews';
        const destFile = bucket.file(`${path}/${uniqueName}`);

        await destFile.save(upload.data, {
          metadata: { contentType: upload.mime },
        });

        const url = `https://storage.googleapis.com/${bucket.name}/${path}/${uniqueName}`;
        result[`${upload.fieldname}Url`] = url;
      }

      await addDoc(collection(db, 'images'), {
        url: result.previewUrl,
        originalUrl: result.originalUrl,
        createdAt: serverTimestamp(),
      });

      return res.status(200).json(result);
    });

    req.pipe(bb);
  } catch (err) {
    console.error('Feil ved opplasting:', err);
    return res.status(500).json({ error: 'Intern feil ved opplasting' });
  }
}
