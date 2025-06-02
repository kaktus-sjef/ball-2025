// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/main_page'); // 👈 Send brukeren videre til hovedgalleriet
}
