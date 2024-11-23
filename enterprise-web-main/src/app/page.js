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

export default function Home() {
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