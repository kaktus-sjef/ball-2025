'use client';

import { useEffect, type ReactNode } from 'react';
import Modal from 'react-modal';

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('#__next'); // trygg initialisering
    }
  }, []);

  return (
    <html lang="en">
      <body id="__next">{children}</body>
    </html>
  );
}
