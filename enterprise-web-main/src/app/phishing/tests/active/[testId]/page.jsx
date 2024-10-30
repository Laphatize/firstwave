'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { SignedIn } from '@clerk/nextjs';
import { Button } from '@/components/catalyst/button';
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';
import { dark } from '@clerk/themes';
import { UserButton } from '@clerk/nextjs';

const TestDetails = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useUser();
  const { organization } = useOrganization();
  const params = useParams();   

 
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



  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch test details
  const fetchTestDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization?.id}/tests/${params.testId}`
      );
      const data = await response.json();
      setTest(data);
    } catch (error) {
      console.error('Error fetching test details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchTestDetails();
    }
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SignedIn>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />

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
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-xl dark:text-white">Loading test details...</p>
                </div>
              ) : test ? (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-md">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold dark:text-white capitalize">
                          {test.type.replace(/-/g, ' ')}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          ID: {test.id}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium
                        ${test.state === 'Live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {test.state}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold dark:text-white mb-2">Campaign Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Scope</p>
                            <p className="dark:text-white capitalize">{test.scope}</p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Created</p>
                            <p className="dark:text-white">
                              {new Date(test.createdAt._seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold dark:text-white mb-2">Context</h3>
                        <p className="dark:text-neutral-300 text-sm">
                          {test.context || 'No context provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold dark:text-white mb-2">Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(test.permissions).map(([key, value]) => (
                          <span key={key} className={`px-3 py-1 rounded-full text-sm
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

                  <div className="flex gap-4">
                    <Button color="red">
                      Stop Campaign
                    </Button>
                    <Button color="white">
                      Download Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-xl dark:text-white">Test not found</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SignedIn>
  );
};

export default TestDetails;