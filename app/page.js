'use client';
import { useEffect, useState } from 'react';
import { db, collection, getDocs } from '@/lib/firebase';

export default function MainPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imgs = [];
      querySnapshot.forEach((doc) => {
        imgs.push(doc.data().url);
      });
      setImages(imgs.reverse()); // nyeste først
    }

    fetchImages();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Bildegalleri</h1>
      {images.length === 0 ? (
        <p className="text-gray-600">Ingen bilder ennå. Last opp via <a className="text-blue-600 underline" href="/admin">/admin</a></p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="border rounded shadow hover:scale-105 transition-transform">
              <img src={url} alt={`Bilde ${idx}`} className="w-full h-auto rounded-t" />
              <a
                href={url}
                download={`bilde-${idx}.jpg`}
                className="block text-center bg-green-500 text-white py-2 rounded-b hover:bg-green-600"
              >
                Last ned
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
