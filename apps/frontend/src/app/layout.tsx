import type { Metadata } from 'next';
import './globals.css';

const CSS_VERSION = '20260819-1'

export const metadata: Metadata = {
  title: {
    default: 'Perissos',
    template: '%s | Perissos',
  },
  description: 'Premium CMS for your business.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:wght@200..800&family=Funnel+Display:wght@400..600&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300..600&family=Manrope:wght@300..600&family=Sora:wght@300..600&family=Space+Grotesk:wght@300..600&family=IBM+Plex+Mono:wght@300;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="digital-agency-template">
        {children}
      </body>
    </html>
  );
}
