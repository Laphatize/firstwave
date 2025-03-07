'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Navbar from '@/components/Navbar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Tests() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserAndTests = async () => {
      try {
        // Fetch user data
        const userRes = await fetch('http://localhost:3001/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          // Fetch tests
          const testsRes = await fetch('http://localhost:3001/api/tests', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (testsRes.ok) {
            const testsData = await testsRes.json();
            setTests(testsData);
          }
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

    fetchUserAndTests();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'running':
        return 'text-blue-400 bg-blue-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-neutral-400 bg-neutral-400/10';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTestDetails = () => {
    if (!selectedTest) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ServerIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">{selectedTest.campaign.name}</h4>
              <p className="text-xs text-neutral-400">{selectedTest.campaign.testConfig.companyName}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full ${getStatusColor(selectedTest.status)}`}>
            <div className="h-2 w-2 rounded-full bg-current" />
            <span className="text-xs font-medium capitalize">{selectedTest.status}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-white mb-2">Test Progress</h5>
            <div className="space-y-2">
              {selectedTest.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  {step.completed ? (
                    <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : step.inProgress ? (
                    <div className="w-4 h-4 relative">
                      <div className="absolute inset-0 rounded-full border-2 border-red-500 border-r-transparent animate-spin" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-700" />
                  )}
                  <span className="text-sm text-neutral-200">{step.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-white mb-2">Test Results</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Success Rate</span>
                <span className="text-sm text-neutral-200">{selectedTest.results.successRate}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${selectedTest.results.successRate}%` }} 
                />
              </div>
            </div>
          </div>

          {selectedTest.results.findings.length > 0 && (
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-2">Findings</h5>
              <div className="space-y-2">
                {selectedTest.results.findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-800/50">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${finding.severity === 'high' ? 'bg-red-500/10 text-red-500' : finding.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'} flex items-center justify-center`}>
                      <span className="text-xs font-medium">{finding.severity.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-200">{finding.description}</p>
                      <p className="text-xs text-neutral-400 mt-1">{finding.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
              <form className="flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-neutral-500"
                    aria-hidden="true"
                  />
                  <input
                    id="search-field"
                    className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                    placeholder="Search tests..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
          </div>

          <main className="lg:pr-96">
            <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Tests</h1>
            </header>

            {/* Test list */}
            <div className="divide-y divide-white/5">
              {tests.map((test) => (
                <div
                  key={test._id}
                  className="group px-4 py-6 sm:px-6 lg:px-8 hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <div className={`flex-none rounded-full p-1 ${getStatusColor(test.status)}`}>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                        <div className="flex gap-x-2">
                          <span className="truncate">{test.campaign.name}</span>
                          <span className="text-neutral-400">/</span>
                          <span className="whitespace-nowrap">{test.campaign.testConfig.companyName}</span>
                        </div>
                      </h2>
                    </div>
                    <div className="flex flex-none items-center gap-x-4">
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          setShowDetailsModal(true);
                        }}
                        className="hidden rounded-md bg-red-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 group-hover:block"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-neutral-400">
                    <p className="truncate capitalize">{test.status}</p>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-neutral-300">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <p className="whitespace-nowrap">{formatDate(test.startedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Test Details Modal */}
      <AnimatePresence mode="wait">
        {showDetailsModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-xl border border-neutral-700 m-4"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-neutral-400 hover:text-neutral-300 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {renderTestDetails()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 