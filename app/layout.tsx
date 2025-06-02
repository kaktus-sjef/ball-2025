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
      <head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
    rel="stylesheet"
  />
</head>

      <body>{children}</body>
    </html>
  );
}
