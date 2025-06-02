'use client';

import { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../lib/firebase';
import Modal from 'react-modal';
import '../styles/main.css';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement(document.body);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('mainAuthorized');
    if (saved !== 'true') {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchImages = async () => {
      const querySnapshot = await getDocs(collection(db, 'images'));
      const imageList = querySnapshot.docs.map((doc) => doc.data().url);
      setImages(imageList);
    };
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 py-6 shadow-md">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-blue text-4xl font-extrabold tracking-wider">BALL-2025</h1>
        </div>
      </header>

      {/* Gallery */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {images.map((url, i) => (
            <div
              key={i}
              className="bg-white aspect-square overflow-hidden rounded-lg shadow hover:scale-105 transition-transform duration-200"
            >
              <img
                src={url}
                alt={`bilde-${i}`}
                onClick={() => setSelectedImage(url)}
                className="object-cover w-full h-full cursor-pointer"
              />
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
        className="max-w-3xl mx-auto mt-20 bg-white p-4 rounded shadow"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start z-50"
      >
        <img src={selectedImage ?? ''} alt="forhåndsvisning" className="w-full rounded" />
        <div className="flex justify-end mt-4">
          <a
            href={selectedImage ?? ''}
            download
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Last ned
          </a>
          <button
            onClick={() => setSelectedImage(null)}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Lukk
          </button>
        </div>
      </Modal>
    </div>
  );
}
