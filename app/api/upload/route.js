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
  
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = file.name;
  
      const blob = bucket.file(filename);
      const stream = blob.createWriteStream({
        resumable: false,
        contentType: file.type,
      });
      
      
  
      return await new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          console.error('Feil i opplasting:', err.message);
          reject(NextResponse.json({ error: err.message }, { status: 500 }));
        });
  
        stream.on('finish', async () => {
            try {
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          
              // 🔥 Lagre i Firestore
              await addDoc(collection(db, 'images'), {
                url: publicUrl,
                createdAt: serverTimestamp(),
              });
          
              resolve(NextResponse.json({ url: publicUrl }));
            } catch (err) {
              console.error('Klarte ikke lagre i Firestore:', err.message);
              reject(NextResponse.json({ error: err.message }, { status: 500 }));
            }
          });
          
          
          
  
        stream.end(buffer);
      });
    } catch (err) {
      console.error('Feil i route handler:', err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  
