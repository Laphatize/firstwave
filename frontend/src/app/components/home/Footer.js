'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-neutral-800 pb-14">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="flex flex-col items-center sm:items-start space-y-2">
            <p className="text-sm text-neutral-400">
              &copy; {new Date().getFullYear()} CTFGuide Corporation. All rights reserved.
            </p>
         
          </div>

          <div className="flex space-x-6">
            <Link 
              href="/terms" 
              className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
            >
              Compliance Hub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 