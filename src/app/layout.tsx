import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/cart/CartComponents";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Romana Natural Products - Empowering Communities Through Nature",
  description: "Empowering communities through innovative food production and sustainable farming practices to make healthy eating accessible and affordable for all. Discover our organic juices and foods from Tanzania.",
  keywords: [
    "organic food",
    "natural products",
    "Tanzania",
    "healthy eating",
    "sustainable farming",
    "organic juices",
    "community empowerment",
    "East Africa",
    "natural nutrition"
  ],
  authors: [{ name: "Romana Natural Products" }],
  creator: "Romana Natural Products Tanzania",
  publisher: "Romana Natural Products",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://romana-natural-products.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Romana Natural Products - Empowering Communities Through Nature",
    description: "Discover our range of organic, natural products designed to nourish your body and delight your senses. From Tanzania with love.",
    url: 'https://romana-natural-products.org',
    siteName: 'Romana Natural Products',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/logos/Romana_Logo_page-0001-removebg-preview.png',
        width: 1200,
        height: 630,
        alt: 'Romana Natural Products - Organic Food from Tanzania',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Romana Natural Products - Empowering Communities Through Nature",
    description: "Discover our range of organic, natural products designed to nourish your body and delight your senses.",
    images: ['/images/logos/Romana_Logo_page-0001-removebg-preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/logos/Romana_Logo_page-0001-removebg-preview.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <CartProvider>
            {children}
            <CartSidebar />
          </CartProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
