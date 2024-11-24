/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Poppins } from "next/font/google";
import "./globals.css";
import 'animate.css';
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Vyvern',
  description: 'AI powered platform for human risk management',
  metadataBase: new URL('https://vyvern.com'), // Replace with your domain
  openGraph: {
    title: 'Vyvern',
    description: 'AI powered platform for human risk management',
    url: 'https://vyvern.com',
    siteName: 'Vyvern',
    images: [
      {
        url: '/thumbnail.png', // Path to your thumbnail image in the public directory
        width: 1200,
        height: 630,
        alt: 'Vyvern - AI Powered HRM',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vyvern',
    description: 'AI powered platform for human risk management',
    images: ['/thumbnail.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-black">
        <body className={`${poppins.variable} font-sans relative min-h-screen`}>
          {/* Grid pattern with fade effect */}
               
          {children}


          <Toaster 
            position="top-right"
            toastOptions={{
              className: '',
              duration: 5000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
            containerStyle={{
              top: 40,
            }}
            gutter={8}
            reverseOrder={false}
            containerClassName="overflow-auto"
          />

        </body>
      </html>
    </ClerkProvider>
  );
}