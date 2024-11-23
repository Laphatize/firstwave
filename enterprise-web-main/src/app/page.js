/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

"use client"
import Hero from "../components/homepage/Hero";
import FeatureCards from "../components/homepage/FeatureCards";
import Pricing from "../components/homepage/Pricing";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'


export default function Home() {


  return (
    <>
      
    
        <Hero />
       
    </>
  );
}