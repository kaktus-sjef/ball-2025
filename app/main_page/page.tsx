'use client';

import { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import Modal from 'react-modal';
import '../../styles/main.css';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';

export default function MainPage() {
  const [images, setImages] = useState<{ id: string; previewUrl: string; originalUrl: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setMenuOpen(!menuOpen);
  const goToAdmin = () => {
    router.push('/admin_login');
    setMenuOpen(false);
  };

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
      const imageList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        previewUrl: doc.data().url,
        originalUrl: doc.data().originalUrl,
      }));      
      setImages(imageList);
    };
    fetchImages();
  }, []);
  

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [selectedIndex]);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="dropdown">
            <button className="clean-button" onClick={toggleDropdown} aria-label="Meny">
              <svg
                className={`gold-icon-static ${menuOpen ? 'animate-middle' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
              >
                <line x1="3" y1="6" x2="21" y2="6" stroke="#d3c35e" strokeWidth="2" />
                <line x1="3" y1="12" x2="21" y2="12" stroke="#d3c35e" strokeWidth="2" className="middle-line" />
                <line x1="3" y1="18" x2="21" y2="18" stroke="#d3c35e" strokeWidth="2" />
              </svg>
            </button>
            {menuOpen && (
              <div className="dropdown-content">
                <button onClick={goToAdmin}>Admin-side</button>
              </div>
            )}
          </div>

          <div className="header-center">
            <div className="header-container">
              <img src="/flourish_left.png" alt="left" />
              <h1 className="header-title">Ball 2025</h1>
              <img src="/flourish_right.png" alt="right" />
            </div>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="gallery">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {images.map((image, i) => (
            <div
            key={image.id}
            className="relative w-full max-w-[400px] h-[400px] bg-white overflow-hidden rounded-lg shadow hover:scale-105 transition-transform duration-200"
            onClick={() => setSelectedIndex(i)}
          >
            <img
              src={image.previewUrl}
              alt={`bilde-${i}`}
              className="gallery-img"
              onClick={() => setSelectedIndex(i)}
            />

          </div>
                 
          ))}
          </div>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={selectedIndex !== null}
        onRequestClose={() => setSelectedIndex(null)}
        className="modal-content"
        overlayClassName="ReactModal__Overlay"
        closeTimeoutMS={300}
      >
        {selectedImage && (
          <div className="modal-image-wrapper">
            <img src={selectedImage.previewUrl} alt="Forhåndsvisning" className="modal-preview" />

            {/* Last ned original */}
            <a
              href={selectedImage.originalUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
            >
              Trykk her for å laste ned bilde med bedre oppløsning
            </a>

            {/* Gull lukkeknapp */}
            <button
              className="modal-close"
              onClick={() => setSelectedIndex(null)}
              aria-label="Lukk bilde"
            >
              <svg className="gold-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
                <path d="M6 6L18 18M18 6L6 18" stroke="#d4c25f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Navigasjon */}
            <button className="modal-button left" onClick={() =>
              setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
            } aria-label="Forrige bilde">
              <FaChevronLeft />
            </button>

            <button className="modal-button right" onClick={() =>
              setSelectedIndex((prev) =>
                prev !== null && prev < images.length - 1 ? prev + 1 : prev
              )
            } aria-label="Neste bilde">
              <FaChevronRight />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
