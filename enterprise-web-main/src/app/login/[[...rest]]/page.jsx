/*
    Copyright (c) 2024 CTFGuide Corporation
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

'use client';

import React from 'react';
import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { dark } from '@clerk/themes';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white p-4">
      <SignedIn>
        {router.push('/dashboard')}
      </SignedIn>
      <SignedOut>
        <div className="w-full max-w-md">
          <div className="mb-8 text-center hidden">
            <Link href="/" className="inline-block">
              <div className="flex items-center justify-center animate__animated animate__fadeIn">
                <img className="w-12 text-center spin-on-hover" src="/branding/logo-light.png" alt="CTFGuide Logo" />
                <h1 className="text-2xl">
                  <span className="font-medium">CTFGuide</span> <span className="font-light">Enterprise</span>
                </h1>
              </div>
            </Link>
          </div>
          <div className="mx-auto w-full max-w-md px-4">
            <SignIn 
              routing="path" 
              appearance={{
                baseTheme: dark
              }}
            />
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default LoginPage;