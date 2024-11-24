/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

"use client"
import MainNavbar from "../components/homepage/MainNavbar";
import Hero from "../components/homepage/Hero";
import Features from "../components/homepage/Features";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Report Web Vitals
      const reportWebVitals = (metric) => {
        console.log(metric);
        // Send to your analytics here
      };

      // Monitor CLS
      let cls = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      }).observe({entryTypes: ['layout-shift']});
    }
  }, []);

  return (
    <div className="relative">
      <MainNavbar />
      <Hero />
      <div className="relative z-10 mt-screen">
        <Features />
      </div>
    </div>
  );
}