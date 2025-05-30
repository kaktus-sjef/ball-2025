'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../lib/firebase'; // ← oppdater stien hvis den er annerledes

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function MainPage() {
  const [authorized, setAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [images, setImages] = useState([]);

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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🎉 Galleriet</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, i) => (
          <a href={url} download key={i}>
            <img src={url} alt={`bilde-${i}`} className="w-full rounded shadow" />
          </a>
        ))}
      </div>
    </div>
  );
}
