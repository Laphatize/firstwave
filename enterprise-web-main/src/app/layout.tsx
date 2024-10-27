/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Poppins } from "next/font/google";
import "./globals.css";
import 'animate.css';

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
      <html lang="en" className="bg-neutral-900">
        <body className={`${poppins.variable} font-sans`}>

     
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}