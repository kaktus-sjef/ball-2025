import { IncomingForm } from 'formidable';
import { bucket } from '@/lib/storage';
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '100mb', // Øker maks tillatt størrelse
  },
};

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true, multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { files } = await parseForm(req);

    const original = files.original;
    const preview = files.preview;

    if (!original || !preview) {
      return res.status(400).json({ error: 'Ugyldige filer' });
    }

    const uploadFile = async (file: any, pathPrefix: string) => {
      const generateUniqueName = (originalName: string) => {
        const ext = originalName.split('.').pop();
        const base = originalName.replace(/\.[^/.]+$/, '');
        const unique = `${base}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        return `${unique}.${ext}`;
      };

      const filename = `${pathPrefix}/${generateUniqueName(file.originalFilename)}`;
      const blob = bucket.file(filename);

      const writeStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
        resumable: false,
      });

      const readStream = fs.createReadStream(file.filepath);
      await new Promise((resolve, reject) => {
        readStream.pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject);
      });

      return `https://storage.googleapis.com/${bucket.name}/${filename}`;
    };

    const originalUrl = await uploadFile(original, 'originals');
    const previewUrl = await uploadFile(preview, 'previews');

    await addDoc(collection(db, 'images'), {
      url: previewUrl,
      originalUrl,
      createdAt: serverTimestamp(),
    });

    return res.status(200).json({ previewUrl, originalUrl });
  } catch (err) {
    console.error('Feil ved opplasting:', err);
    return res.status(500).json({ error: 'Intern feil ved opplasting' });
  }
}
