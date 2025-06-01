import { Storage } from '@google-cloud/storage';
import path from 'path';

const keyPath = path.join(process.cwd(), 'GCS_key.env'); // navn på nøkkelfilen

const storage = new Storage({ keyFilename: keyPath });

export const bucket = storage.bucket('ball-2025'); // ← sett riktig navn
