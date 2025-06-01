'use client';
import React, { useEffect } from 'react';
import Modal from 'react-modal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body'); // <== IKKE '#__next'
    }
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
