'use client';

import { useEffect, useState } from 'react';
import { db, collection, getDocs } from '../../lib/firebase';
import Modal from 'react-modal';
import '../../styles/main.css';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function MainPage() {
  const [images, setImages] = useState<{ id: string; previewUrl: string; originalUrl: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDropdown = () => setMenuOpen(!menuOpen);

  const goToAdmin = () => {
    router.push('/admin_login');
    setMenuOpen(false);
  };

  const goToHelp = () => {
    alert(
      'Slik laster du ned bildet:\n\n1. Klikk på bildet du ønsker å laste ned i galleriet.\n\n2. Trykk på "Last ned"-lenken under bildet.\n\n3. Vent på at bildet laster inn (kan ta litt tid).\n\n4. På PC: høyreklikk på bildet og velg "Last ned" eller "Lagre bildet som".\n\n5. NB! På Mac: du kan ha satt høyreklikk (sekundærklikk) til en annen innstilling.\n--5.1. Om du ikke husker innstillingen kan du gå under "Mouse" eller "Trackpad" i System Settings og se hva du har satt secondary click som.\n\n6. På mobil: hold inne på bildet og velg "Last ned" eller "Lagre bilde".'
    );
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
      const imageList = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          if (!data.previewUrl || !data.originalUrl) return null;
          const match = data.originalUrl.match(/MG_(\d+)\./);
          const number = match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
          return {
            id: doc.id,
            previewUrl: data.previewUrl,
            originalUrl: data.originalUrl,
            sortNumber: number,
          };
        })
        .filter((img): img is { id: string; previewUrl: string; originalUrl: string; sortNumber: number } => img !== null)
        .sort((a, b) => a.sortNumber - b.sortNumber);
      setImages(imageList.map(({ sortNumber, ...rest }) => rest));
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (selectedIndex !== null) {
      setLastScrollY(window.scrollY);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      window.scrollTo({ top: lastScrollY });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenGalleryPopup');
    if (!hasSeenPopup) {
      setShowPopup(true);
      localStorage.setItem('hasSeenGalleryPopup', 'true');
    }
  }, []);

  const prevImage = () =>
    setSelectedIndex(i => (i !== null && i > 0 ? i - 1 : i));
  const nextImage = () =>
    setSelectedIndex(i => (i !== null && i < images.length - 1 ? i + 1 : i));

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50; // min swipe avstand
    if (deltaX > threshold) prevImage();
    else if (deltaX < -threshold) nextImage();
    setTouchStartX(null);
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="dropdown">
            <button className="clean-button" onClick={toggleDropdown} aria-label="Meny">
              {/* SVG-menyikon */}
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
                <button onClick={goToHelp}>Hjelp</button>
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
                onClick={() => {
                  if (selectedIndex === null) {
                    setLastScrollY(window.scrollY);
                    setTimeout(() => {
                      window.scrollTo({ top: 230, behavior: 'smooth' });
                    }, 0);
                  }
                  setSelectedIndex(i);
                }}
              >
                {image.previewUrl ? (
                  <img
                    src={image.previewUrl}
                    alt={`bilde-${i}`}
                    className="gallery-img"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-500 bg-gray-100">
                    Mangler preview
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Første-gangs popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>!! Viktig info før du går videre !!</h2>
            <p>
              Bildene du ser i galleriet er <strong>komprimerte og har lav oppløsning</strong>. For å få originalbildet i full kvalitet,
              må du <strong>klikke på bildet</strong> og deretter trykke på <strong>lenken under bildet</strong>.
            </p>
            <p>
              Du vil bli tatt med til en ekstern side der du kan laste ned orginalbildet.
            </p>
            <p>
              !! Hvis du har problemer med å laste ned bildet, kan du gå til <strong>menyen øverst til venstre</strong> og trykke på <strong>Hjelp</strong>.
              Der finner du enkle instruksjoner. !!
            </p>
            <button onClick={() => setShowPopup(false)} className="popup-close-button">
              Skjønner
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={selectedIndex !== null}
        onRequestClose={() => setSelectedIndex(null)}
        className="modal-content"
        overlayClassName="ReactModal__Overlay"
        closeTimeoutMS={300}
        shouldCloseOnOverlayClick={false}
      >
        {selectedImage && (
          <div
            className="modal-image-wrapper"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={selectedImage.previewUrl}
              alt="Forhåndsvisning"
              className="modal-preview-image"
            />

            <a
              href={selectedImage.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
            >
              Trykk her for å laste ned bildet med bedre oppløsning
            </a>
            <p className="text-sm text-white mt-2 text-center">
              <strong>!!</strong> Trenger du hjelp med å laste ned bildet? Trykk på{' '}
              <strong onClick={goToHelp} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Hjelp
              </strong>{' '}
              i menyen øverst til venstre. <strong>!!</strong>
            </p>

            {/* Lukke-knapp */}
            <button
              className="modal-close"
              onClick={() => setSelectedIndex(null)}
              aria-label="Lukk bilde"
            >
              <svg className="gold-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
                <path d="M6 6L18 18M18 6L6 18" stroke="#d4c25f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Piler */}
            <button className="modal-button left" onClick={prevImage} aria-label="Forrige bilde">
              <FaChevronLeft />
            </button>
            <button className="modal-button right" onClick={nextImage} aria-label="Neste bilde">
              <FaChevronRight />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
