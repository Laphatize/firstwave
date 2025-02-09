'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-gray-800 pb-14">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Pranav Ramesh & Kshitij Kochhar. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link 
              href="/terms" 
              className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 