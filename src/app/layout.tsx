
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TridimLab',
  description: 'Metti alla prova la tua conoscenza con il quiz di TridimLab!',
  icons: {
    icon: 'https://i.imgur.com/XPtFUdG.png', // Imposta il favicon
    // apple: 'https://i.imgur.com/XPtFUdG.png', // Opzionale per Apple touch icons
    // shortcut: 'https://i.imgur.com/XPtFUdG.png', // Opzionale per browser più vecchi
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
