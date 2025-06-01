import { Storage } from '@google-cloud/storage';
import fs from 'fs';

let credentials;

if (process.env.NODE_ENV === 'development') {
  console.log('Bruker lokal nøkkel fra gcs_key.json');
  credentials = JSON.parse(fs.readFileSync('gcs_key.json', 'utf-8'));
} else {
  credentials = JSON.parse(process.env.GCS_KEY.replace(/\\n/g, '\n'));

}

const storage = new Storage({
  projectId: credentials.project_id,
  credentials,
});

export const bucket = storage.bucket('ball-2025'); // ← bruk ditt bucket-navn