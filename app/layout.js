import { Noto_Sans_Thai, IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import JsonLd from './components/JsonLd';
import ClientLayout from './components/ClientLayout';

const notoSansThai = Noto_Sans_Thai({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-noto-sans-thai',
});

const plexSansThai = IBM_Plex_Sans_Thai({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-plex-sans-thai',
});

export const metadata = {
  title: 'สภาอุตสาหกรรมแห่งประเทศไทย | The Federation of Thai Industries',
  description: 'เว็บไซต์ทางการของสภาอุตสาหกรรมแห่งประเทศไทย ศูนย์รวมข้อมูลและบริการสำหรับสมาชิก',
  keywords: 'สภาอุตสาหกรรม, FTI, อุตสาหกรรมไทย, สมาชิกสภาอุตสาหกรรม, Federation of Thai Industries',
  authors: [{ name: 'สภาอุตสาหกรรมแห่งประเทศไทย' }],
  creator: 'สภาอุตสาหกรรมแห่งประเทศไทย',
  publisher: 'สภาอุตสาหกรรมแห่งประเทศไทย',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fti.or.th'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'สภาอุตสาหกรรมแห่งประเทศไทย | The Federation of Thai Industries',
    description: 'เว็บไซต์ทางการของสภาอุตสาหกรรมแห่งประเทศไทย ศูนย์รวมข้อมูลและบริการสำหรับสมาชิก',
    url: 'https://fti.or.th',
    siteName: 'สภาอุตสาหกรรมแห่งประเทศไทย',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'สภาอุตสาหกรรมแห่งประเทศไทย',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'สภาอุตสาหกรรมแห่งประเทศไทย | The Federation of Thai Industries',
    description: 'เว็บไซต์ทางการของสภาอุตสาหกรรมแห่งประเทศไทย',
    images: ['/images/twitter-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${plexSansThai.variable}`}>
      <head>
        <JsonLd />
      </head>
      <body className="font-noto">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
