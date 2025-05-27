import { Noto_Sans_Thai, IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

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
  title: 'FTI Member Portal',
  description: 'สภาอุตสาหกรรมแห่งประเทศไทย',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${plexSansThai.variable}`}>
      <body className="font-noto">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
