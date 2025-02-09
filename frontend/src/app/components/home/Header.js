'use client';

import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import Image from 'next/image';

export default function Header() {
  return (
    <div className="relative isolate overflow-hidden bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:pt-8">
          <h1 className="text-4xl font-bold bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <svg 
              className="w-10 h-10 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" 
              />
            </svg>
            Firstwave
          </h1>
          <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-white sm:text-7xl">
            Secure Your <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-10 rounded-lg -rotate-1 transform"></span>
              <span className="absolute inset-0 bg-gradient-to-l from-pink-500 via-purple-500 to-indigo-500 px-10 rounded-lg rotate-1 transform"></span>
              <span className="relative z-10 text-indigo-100 font-bold">Workforce</span>
            </span>
          </h1>
          <p className="mt-8 text-lg font-medium text-pretty text-zinc-400 sm:text-xl/8">
            We leverage AI-driven social engineering to pinpoint and resolve human vulnerabilities, <span className="text-indigo-500  font-bold"> protecting </span> your enterprise from the inside out.          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-md transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <FaUserPlus className="w-4 h-4" />
              Get Started
            </button>
            <button className="text-sm font-semibold text-zinc-300 flex items-center gap-2 hover:text-indigo-400 transition-colors">
              <FaSignInAlt className="w-4 h-4" />
              Login
            </button>
          </div>

          {/* Logo Cloud Section */}
          <div className="hidden mt-16 sm:mt-24 border-t border-zinc-800 pt-8">
            <p className="text-sm font-semibold leading-6 text-zinc-400 mb-6">
              Trusted by security teams worldwide
            </p>
            <div className="mt-4 grid grid-cols-3 md:grid-cols-6 w-full gap-4">
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/capitalone.com"
                  alt="Capital One"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/jpmorganchase.com"
                  alt="JPMorgan Chase"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="relative h-20">
                <Image
                  className="rounded-sm opacity-80 hover:opacity-100 transition-all duration-300"
                  src="https://logo.clearbit.com/anduril.com"
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
            <div className="relative w-[56rem] h-[35rem]">
              <Image
                src="/cropped_dashboard.png"
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
    </div>
  );
}