import { Noto_Sans_Thai, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import JsonLd from "./components/JsonLd";
import ClientLayout from "./components/ClientLayout";
import FaqBotProvider from "./components/FaqBot/FaqBotProvider";

const notoSansThai = Noto_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  display: "swap",
  variable: "--font-noto-sans-thai",
});

const plexSansThai = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai"],
  display: "swap",
  variable: "--font-plex-sans-thai",
});

export const metadata = {
  title: "สภาอุตสาหกรรมแห่งประเทศไทย | The Federation of Thai Industries",
  description: "เว็บไซต์ทางการของสภาอุตสาหกรรมแห่งประเทศไทย ศูนย์รวมข้อมูลและบริการสำหรับสมาชิก",
  keywords: "สภาอุตสาหกรรม, FTI, อุตสาหกรรมไทย, สมาชิกสภาอุตสาหกรรม, Federation of Thai Industries",
  authors: [{ name: "สภาอุตสาหกรรมแห่งประเทศไทย" }],
  creator: "สภาอุตสาหกรรมแห่งประเทศไทย",
  publisher: "สภาอุตสาหกรรมแห่งประเทศไทย",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fti.or.th"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      // Primary favicon (FTI WebP logo)
      {
        url: "/images/Logo_FTI.webp",
        type: "image/webp",
      },
      // Fallbacks
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    shortcut: "/favicon.ico",
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  openGraph: {
    title: "สภาอุตสาหกรรมแห่งประเทศไทย | The Federation of Thai Industries",
    description: "เว็บไซต์ทางการของสภาอุตสาหกรรมแห่งประเทศไทย ศูนย์รวมข้อมูลและบริการสำหรับสมาชิก",
    url: "https://fti.or.th",
    siteName: "สภาอุตสาหกรรมแห่งประเทศไทย",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "สภาอุตสาหกรรมแห่งประเทศไทย",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "สภาอุตสาหกรรมแห่งประเทศไทย | The Federation of Thai Industries",
    description: "เว็บไซต์ทางการของสภาอุตสาหกรรมแห่งประเทศไทย",
    images: ["/images/twitter-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${plexSansThai.variable}`}>
      <head>
        <JsonLd />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-noto">
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          {process.env.NEXT_PUBLIC_ENABLE_FAQ_BOT === "true" && <FaqBotProvider />}
        </Providers>
      </body>
    </html>
  );
}
