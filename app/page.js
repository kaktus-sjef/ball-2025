'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../lib/firebase'; // ← oppdater stien hvis den er annerledes
import Modal from 'react-modal';

Modal.setAppElement('#__next');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function MainPage() {
  const [authorized, setAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);


  const CORRECT_PASSWORD = 'ball2025';

  useEffect(() => {
    const saved = localStorage.getItem('mainAuthorized');
    if (saved === 'true') setAuthorized(true);
  }, []);

  useEffect(() => {
    if (authorized) {
      const fetchImages = async () => {
        const querySnapshot = await getDocs(collection(db, 'images'));
        const imageList = querySnapshot.docs.map((doc) => doc.data().url);
        setImages(imageList);
      };
      fetchImages();
    }
  }, [authorized]);

  const handleLogin = () => {
    if (inputPassword === CORRECT_PASSWORD) {
      localStorage.setItem('mainAuthorized', 'true');
      setAuthorized(true);
    } else {
      alert('Feil passord!');
    }
  };

  if (!authorized) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Skriv inn passord for å se galleriet</h1>
        <input
          type="password"
          className="border p-2 rounded"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Logg inn
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {images.map((url, i) => (
    <div key={i} className="relative">
      <img
        src={url}
        alt={`bilde-${i}`}
        onClick={() => setSelectedImage(url)}
        className="cursor-pointer w-full rounded shadow hover:scale-105 transition"
      />
    </div>
  ))}
  <Modal
  isOpen={!!selectedImage}
  onRequestClose={() => setSelectedImage(null)}
  className="max-w-3xl mx-auto mt-20 bg-white p-4 rounded shadow"
  overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start z-50"
>
  <img src={selectedImage} alt="forhåndsvisning" className="w-full rounded" />
  <div className="flex justify-end mt-4">
    <a
      href={selectedImage}
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
