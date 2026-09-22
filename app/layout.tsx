import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FAKE_SPEAK - AI Speaking Exam Laboratory',
  description: 'AI-powered adaptive speaking exam preparation for IELTS and TOEIC Speaking. Zero repetition, strict official rubrics, and 100% private local audio.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#fcf8f8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#fcf8f8] text-[#1c1b1b] min-h-screen selection:bg-[#dbe1ff] selection:text-[#0050d7] antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
