'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Navbar from '@/components/Navbar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const stats = [
  { name: 'Total Campaigns', value: '12', change: '+2', changeType: 'increase' },
  { name: 'Active Tests', value: '3', change: '+1', changeType: 'increase' },
  { name: 'Success Rate', value: '85%', change: '+4%', changeType: 'increase' },
  { name: 'Total Organizations', value: '2', change: '0', changeType: 'neutral' },
];

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-500 to-red-400 bg-clip-text text-transparent">
          <div className="flex items-center gap-2">
            <svg 
              className="w-10 h-10 text-red-500" 
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
            <span>Vyvern</span>
          </div>
        </h1>
      </div>
    );
  }

  return (
    <>
      <div className="bg-neutral-900 min-h-screen">
        <Navbar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <div className="xl:pl-72">
          {/* Sticky search header */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-neutral-900 px-4 shadow-sm sm:px-6 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-white xl:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <select
                  className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
                  defaultValue="7d"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </div>

          <main>
            <header className="border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Analytics</h1>
            </header>

            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="bg-neutral-800/50 rounded-lg px-6 py-4 border border-neutral-700/50"
                  >
                    <p className="text-sm font-medium leading-6 text-neutral-400">{stat.name}</p>
                    <div className="mt-2 flex items-baseline gap-x-2">
                      <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                      <p
                        className={classNames(
                          stat.changeType === 'increase' ? 'text-green-500' : 
                          stat.changeType === 'decrease' ? 'text-red-500' : 
                          'text-neutral-500',
                          'text-xs font-medium'
                        )}
                      >
                        {stat.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Campaign Success Rate */}
                <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
                  <h2 className="text-sm font-medium text-neutral-400">Campaign Success Rate</h2>
                  <div className="mt-6 h-[240px] flex items-center justify-center">
                    <p className="text-sm text-neutral-500">Chart coming soon</p>
                  </div>
                </div>

                {/* Test Distribution */}
                <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
                  <h2 className="text-sm font-medium text-neutral-400">Test Distribution</h2>
                  <div className="mt-6 h-[240px] flex items-center justify-center">
                    <p className="text-sm text-neutral-500">Chart coming soon</p>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="lg:col-span-2 bg-neutral-800/50 rounded-lg p-6 border border-neutral-700/50">
                  <h2 className="text-sm font-medium text-neutral-400">Activity Timeline</h2>
                  <div className="mt-6 h-[240px] flex items-center justify-center">
                    <p className="text-sm text-neutral-500">Chart coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 