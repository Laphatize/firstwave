'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { SignedIn } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/catalyst/button';
import { dark } from '@clerk/themes';
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';


const ActiveTests = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();

  // Add state for tests
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add fetch function
  const fetchTests = async () => {
    try {
      const orgId = organization?.id; // Assuming you have a function to get current org ID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgId}/tests`);
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to fetch on component mount
  useEffect(() => {
    fetchTests();
  }, [organization]);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = storedDarkMode !== null 
      ? storedDarkMode === 'true' 
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // Replace sidebar toggle with actual data handling
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add handler for test click
  const handleTestClick = (testId) => {
    router.push(`/phishing/tests/active/${testId}`);
  };

  return (
    <SignedIn>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarToggle} darkMode={darkMode}>
        </Sidebar>

        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : ''}`}>
          <Navbar>
            <div className="flex items-center">
              {!sidebarOpen && (
                <Button onClick={handleSidebarToggle} className="mr-4 cursor-pointer text-neutral-800 dark:text-white" color="neutral">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              )}
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Active Tests</h1>
            </div>
            <div className="flex items-center space-x-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-gray-200 border-2 border-neutral-300 dark:border-transparent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {darkMode ? '🌙' : '️'}
                </span>
              </label>
              <UserButton appearance={{
                baseTheme: darkMode ? dark : undefined
              }}/>
            </div>
          </Navbar>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
            <div className="container mx-auto px-6 py-8">
              {!organization ? (
                <div className='flex justify-center items-center h-screen'>
                  <p className='text-2xl font-bold dark:text-white'>Loading...</p>
                </div>
              ) : (
                <div className="space-y-6 ">
                  <div className="flex justify-between items-center hidden">
                    <h2 className="text-2xl font-bold dark:text-white">Active Phishing Tests</h2>
                    <Button color="red" onClick={() => window.location.href='/phishing/create'}>
                      Create New Test
                    </Button>
                  </div>

                  <div className="grid gap-6">
                  
                  {tests.map(test => (
                    <div 
                      key={test.id} 
                      onClick={() => handleTestClick(test.id)}
                      className={`bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md 
                        hover:bg-gradient-to-br from-red-800/50 to-red-800/9 
                        hover:scale-[1.02] hover:shadow-lg transform transition-all duration-200 ease-in-out cursor-pointer
                        ${test.state === 'Live' ? ' relative' : ''}`}
                    >
                      {test.state === 'Live' && (
                        <div className="absolute -top-1 -right-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                              {
                                'Pending Approval': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                                'Starting Soon': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                                'Live': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                'Taking a Break': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }[test.state]
                            }`}>
                              <div className="flex items-center gap-2 px-4 ">
                                {test.state === 'Live' && (
                                  <span className="flex h-2 ">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                )}
                                {test.state}
                              </div>
                            </span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold dark:text-white capitalize">
                              {test.type.replace(/-/g, ' ')}
                            </h3>
                        
                          </div>
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            ID: {test.id}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Scope</p>
                          <p className="text-neutral-800 dark:text-neutral-200 capitalize">{test.scope}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Created</p>
                          <p className="text-neutral-800 dark:text-neutral-200">
                            {new Date(test.createdAt._seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(test.permissions).map(([key, value]) => (
                            <span key={key} className={`px-2 py-1 rounded-md text-xs
                              ${value 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SignedIn>
  );
};

export default ActiveTests;
