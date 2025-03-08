'use client';

import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const targetWord = 'WORKFORCE';
  const [displayText, setDisplayText] = useState('101010101');

  useEffect(() => {
    let currentIndex = 0;
    const morphInterval = setInterval(() => {
      if (currentIndex >= targetWord.length) {
        // Force final state to be exactly WORKFORCE
        setDisplayText(targetWord);
        clearInterval(morphInterval);
        return;
      }

      setDisplayText(prev => {
        const result = prev.split('');
        result[currentIndex] = targetWord[currentIndex];
        return result.join('');
      });
      currentIndex++;
    }, 200);

    // Binary number changing effect
    const binaryInterval = setInterval(() => {
      setDisplayText(prev => {
        if (prev === targetWord) {
          clearInterval(binaryInterval);
          return prev;
        }
        const chars = prev.split('');
        return chars.map((char, i) => {
          // Don't change characters that are already correct
          if (char === targetWord[i]) return char;
          return Math.random() < 0.5 ? '0' : '1';
        }).join('');
      });
    }, 50);

    return () => {
      clearInterval(morphInterval);
      clearInterval(binaryInterval);
    };
  }, []);

  return (
    <div className="relative isolate overflow-hidden bg-zinc-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="https://www.vyvern.com/trans_logo.png" alt="Vyvern Logo" className="h-8 w-auto"/>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <div className="flex items-center gap-4 ml-4">
                <Link 
                  href="/login"
                  className="text-sm font-semibold text-zinc-300 flex items-center gap-2 hover:text-red-400 transition-colors"
                >
                  <FaSignInAlt className="w-4 h-4" />
                  Login
                </Link>
                <Link 
                  href="/dashboard"
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-zinc-300 hover:text-red-400 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <RiCloseLine className="h-6 w-6" />
                ) : (
                  <RiMenu3Line className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="sm:hidden">
              <div className="space-y-4 px-2 pb-3 pt-2">
                <Link
                  href="/login"
                  className="text-zinc-300 hover:text-red-400 block rounded-md px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FaSignInAlt className="w-4 h-4" />
                    Login
                  </div>
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-red-600 hover:bg-red-500 text-white block rounded-md px-3 py-2 text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <FaUserPlus className="w-4 h-4" />
                    Get Started
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl shrink-0 lg:mx-0 lg:pt-8 mt-20">
          <img src="https://www.vyvern.com/trans_logo.png" className="w-32" />
          <h1 className="text-5xl font-semibold tracking-tight text-pretty text-white">
            Secure Your <span className="relative inline-block px-2">
              <span className="absolute inset-0 bg-red-600 px-10 rounded-lg transform"></span>
              <span className="relative z-10 text-white font-bold font-mono">
                <span className="binary-text">{displayText}</span>
              </span>
            </span>
          </h1>
          <p className="mt-2 text-lg font-medium text-pretty text-zinc-400 sm:text-xl/8">
            We leverage AI-driven social engineering to pinpoint and resolve human vulnerabilities, <span className="text-red-500 font-bold">protecting</span> your enterprise from the inside out.
          </p>
          <div className="mt-4 flex items-center gap-x-6">
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-md transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <FaUserPlus className="w-4 h-4" />
              Get Started
            </button>
            <button className="text-sm font-semibold text-zinc-300 flex items-center gap-2 hover:text-red-400 transition-colors">
              <FaSignInAlt className="w-4 h-4" />
              Login
            </button>
          </div>

          {/* Logo Cloud Section */}
          <div className="hidden  mt-16 sm:mt-24 border-t border-zinc-800 pt-8">
            <p className="text-sm font-semibold leading-6 text-zinc-400 mb-6">
              Trusted by security teams worldwide
            </p>
            <div className="mt-4 grid grid-cols-3 md:grid-cols-6 w-full gap-4">
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/ctfguide.com"
                  alt="CTFGuide"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/knowt.com"
                  alt="Knowt"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/sork"
                  alt="Anduril"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/comcast.com"
                  alt="Comcast"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/lockheedmartin.com"
                  alt="Lockheed Martin"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/nationwide.com"
                  alt="Nationwide"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="relative w-[52rem] h-[30rem]">
              <Image
                src="/home_mock.png"
                alt="Security Dashboard"
                fill
                priority
                className="rounded-md bg-zinc-800/50 ring-1 shadow-2xl ring-zinc-700/50"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {/* AI-Powered Personas */}
          <div className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-red-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-3 w-fit border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">AI-Powered Personas</h3>
            <p className="mt-2 text-zinc-400">Generate sophisticated social engineering profiles using advanced AI agents to test employee security awareness.</p>
          </div>

          {/* Compliance Reporting */}
          <div className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-red-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-3 w-fit border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3H12m-.75 3h.008v.008h-.008v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Compliance Reporting</h3>
            <p className="mt-2 text-zinc-400">Automated NIST-compliant security assessment reports with detailed vulnerability analysis and recommendations.</p>
          </div>

          {/* Targeted Campaigns */}
          <div className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-red-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-3 w-fit border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Targeted Campaigns</h3>
            <p className="mt-2 text-zinc-400">Design and execute controlled social engineering campaigns to identify security gaps in your organization.</p>
          </div>

          {/* Analytics Dashboard */}
          <div className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-red-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-3 w-fit border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Analytics Dashboard</h3>
            <p className="mt-2 text-zinc-400">Track campaign effectiveness, employee vulnerability metrics, and security awareness trends in real-time.</p>
          </div>

          {/* Training Integration */}
          <div className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-red-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-3 w-fit border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Training Integration</h3>
            <p className="mt-2 text-zinc-400">Automatically assign targeted security awareness training based on employee performance in campaigns.</p>
          </div>

          {/* Multi-Channel Testing */}
          <div className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50 hover:border-red-500/20 transition-all duration-300">
            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-3 w-fit border border-red-500/20">
              <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Multi-Channel Testing</h3>
            <p className="mt-2 text-zinc-400">Deploy AI agents across email, SMS, voice calls, and social media to comprehensively test security protocols.</p>
          </div>
        </div>
      </div>
    </div>
  );
}