/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

"use client"
import MainNavbar from "../components/homepage/MainNavbar";
import Hero from "../components/homepage/Hero";
import Features from "../components/homepage/Features";
import MobileHero from "../components/homepage/MobileHero";
import MobileFeatures from "../components/homepage/MobileFeatures";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative">
      <MainNavbar />
      {isMobile ? (
        <>
          <MobileHero />
          <MobileFeatures />
        </>
      ) : (
        <>
          <Hero />
          <div className="relative z-10 mt-screen">
            <Features />
          </div>
        </>
      )}
    </div>
  );
}