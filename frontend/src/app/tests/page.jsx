'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon } from '@heroicons/react/20/solid';
import { BuildingOfficeIcon, PlusIcon } from '@heroicons/react/24/outline';
import Navbar from '@/components/Navbar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TestSuites() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tests, setTests] = useState([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [newTest, setNewTest] = useState({ 
    name: '', 
    description: '', 
    type: 'credential_harvest',
    targetGroups: [],
    emailTemplate: '',
    landingPage: '',
    schedule: 'immediate'
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserAndTests = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          // Fetch tests
          const testsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            
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

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTest)
      });
      
      if (response.ok) {
        const createdTest = await response.json();
        setTests(prev => [...prev, createdTest]);
        setShowTestModal(false);
        setNewTest({ name: '', description: '', type: 'credential_harvest', targetGroups: [], emailTemplate: '', landingPage: '', schedule: 'immediate' });
      }
    } catch (error) {
      console.error('Failed to create test:', error);
    }
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
          </div>

          <main>
            <header className="border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Phishing Campaigns</h1>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                Configure and manage your phishing simulation campaigns.
              </p>
            </header>

            <div className="divide-y divide-white/5">
              <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto">
                  <div className="space-y-12">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-semibold leading-7 text-white">Campaign Configurations</h2>
                          <p className="mt-1 text-sm leading-6 text-neutral-400">
                            Set up and customize your phishing test scenarios.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowTestModal(true)}
                          className="flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                        >
                          <PlusIcon className="h-4 w-4" />
                          New Campaign
                        </button>
                      </div>

                      <div className="mt-6 divide-y divide-white/5">
                        {tests.map((test) => (
                          <div key={test.id} className="py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-white">{test.name}</h3>
                                <p className="text-sm text-neutral-400">{test.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20">
                                    {test.type}
                                  </span>
                                  {test.schedule && (
                                    <span className="inline-flex items-center rounded-md bg-neutral-400/10 px-2 py-1 text-xs font-medium text-neutral-400 ring-1 ring-inset ring-neutral-400/20">
                                      {test.schedule}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-auto flex gap-2">
                                <button className="rounded-md bg-neutral-800 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700">
                                  Edit
                                </button>
                                <button className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
                                  Launch Campaign
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {tests.length === 0 && (
                          <div className="py-4 text-center">
                            <p className="text-sm text-neutral-400">No campaign configurations yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* New Test Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowTestModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-xl border border-neutral-700 m-4"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">Create New Campaign Configuration</h3>
              <form onSubmit={handleCreateTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={newTest.name}
                    onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter campaign name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Describe the campaign objectives and target audience"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Attack Type
                  </label>
                  <select
                    value={newTest.type}
                    onChange={(e) => setNewTest(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="credential_harvest">Credential Harvest</option>
                    <option value="data_entry">Data Entry</option>
                    <option value="attachment">Malicious Attachment</option>
                    <option value="link_click">Link Click</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Email Template
                  </label>
                  <select
                    value={newTest.emailTemplate}
                    onChange={(e) => setNewTest(prev => ({ ...prev, emailTemplate: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a template</option>
                    <option value="password_reset">Password Reset</option>
                    <option value="invoice">Invoice Payment</option>
                    <option value="document_share">Document Share</option>
                    <option value="custom">Custom Template</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Schedule
                  </label>
                  <select
                    value={newTest.schedule}
                    onChange={(e) => setNewTest(prev => ({ ...prev, schedule: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="immediate">Launch Immediately</option>
                    <option value="scheduled">Schedule for Later</option>
                    <option value="staged">Staged Rollout</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowTestModal(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 