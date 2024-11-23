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
  title: "Firstwave",
  description: "AI powered social engineering",
};

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