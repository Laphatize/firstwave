'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { SignedIn } from '@clerk/nextjs';
import { Button } from '@/components/catalyst/button';
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { dark } from '@clerk/themes';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const TestDetails = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useUser();
  const { organization } = useOrganization();
  const params = useParams();   
  const [liveViewMessages, setLiveViewMessages] = useState([]);
  const liveViewRef = useRef(null);
  const router = useRouter();

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

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add this effect to scroll to bottom when new messages arrive
  useEffect(() => {
    if (liveViewRef.current) {
      liveViewRef.current.scrollTop = liveViewRef.current.scrollHeight;
    }
  }, [liveViewMessages]);

  // Add this effect to listen for live view updates
  useEffect(() => {
    if (!organization || !test) return;

    const liveViewRef = collection(db, 'organizations', organization.id, 'tests', params.testId, 'liveView');
    const q = query(liveViewRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setLiveViewMessages(messages);
    });

    return () => unsubscribe();
  }, [organization, test]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderMessage = (message) => {
    const isError = message.content.toLowerCase().includes('error');
    
    switch (message.role) {
      case 'Agent':
        return (
          <div className='hover:bg-neutral-900/50 bg-neutral-900 dark:text-white px-4 py-2 mb-2'>
            <div className='flex justify-between items-center'>
              <h1 className='w-[90%]'>
                <span className='text-yellow-500 font-bold'>Agent:</span> {message.content}
              </h1>
              <span className='text-neutral-500 text-sm'>{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        );

      case 'Function Runner':
        return (
          <div className='hover:bg-neutral-900/50 bg-neutral-900 dark:text-white px-4 py-2 mb-2'>
            <div className='flex justify-between items-center'>
              <h1 className='w-[90%]'>
                <span className='text-yellow-500 font-bold'>Function Runner:</span> {message.content}
              </h1>
              <span className='text-neutral-500 text-sm'>{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        );

      case 'System':
        return (
          <div className={`bg-neutral-900 hover:bg-neutral-900/50  dark:text-white px-4 py-2 mb-2 ${isError ? 'dark:text-red-500' : ''}`}>
            <div className='flex justify-between items-center'>
              <h1 className='w-[90%]'>
                <span className='text-red-500 font-bold'>System:</span> {message.content}

                <hr className='mt-3 border-neutral-400'/>
                <p className='text-sm mt-1 text-neutral-400'>Typically, tests will terminate due to interfacing error or because of our ethics systems. A developer will look into this error and resume it.</p>
              </h1>
              <span className='text-red-500 text-sm'>{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseDetails = () => {
    setSelectedMessage(null);
  };

  return (
    <SignedIn>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''} ${selectedMessage ? 'blur-background' : ''}`}>
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
              <Button onClick={() => router.back()} className="mr-4 cursor-pointer text-neutral-800 dark:text-white" color="neutral">
                Back
              </Button>
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

          <main className="flex-1 overflow-x-hidden h-screen bg-neutral-100 dark:bg-neutral-900">
            <div className="container mx-auto px-6 py-8">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-xl dark:text-white">Loading test details...</p>
                </div>
              ) : test ? (
                <div className='grid grid-cols-3'>
                <div className="space-y-6 col-span-1">
                  <div className="bg-white dark:bg-neutral-800 p-8 rounded-l-lg shadow-md">
                    <div className=" justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold dark:text-white capitalize">
                          {test.type.replace(/-/g, ' ')}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                           {test.id}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs mt-2 font-medium w-fit
                        ${test.state === 'Live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {test.state}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-6">
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
                <div className='bg-neutral-800 col-span-2 rounded-r-lg rounded-bl-lg border-l border-neutral-700/50 p-8'>
                  <div className='flex justify-between items-center mb-4'>
                    <h1 className='dark:text-white text-lg'>Live View</h1>
                    <div className='flex items-center gap-2'>
                      {test?.state === 'Live' && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                      <span className='text-neutral-400 text-sm'>
                        {test?.state === 'Live' ? 'Attack in progress' : test?.state}
                      </span>
                    </div>
                  </div>

                  <div 
                    ref={liveViewRef}
                    className='overflow-y-scroll h-[80vh] scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800'
                  >
                    {liveViewMessages.length === 0 ? (
                      <div className='flex justify-center items-center h-full'>
                        <p className='text-neutral-400'>Waiting for attack to begin...</p>
                      </div>
                    ) : (
                      liveViewMessages.map((message) => (
                        <div key={message.id} onClick={() => handleMessageClick(message)}>
                          {renderMessage(message)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
             </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-xl dark:text-white">Test not found</p>
                </div>
              )}
              {selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg max-w-2xl w-full">
                    <h2 className="text-xl font-bold dark:text-white">{selectedMessage.role}</h2>
                    <p className="dark:text-white">{selectedMessage.content}</p>
                    <span className='text-neutral-500 text-sm'>{formatTimestamp(selectedMessage.timestamp)}</span>
                    <div className="flex justify-end">
                      <Button onClick={handleCloseDetails} color="red" className="mt-4">
                        Close
                      </Button>
                    </div>
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

export default TestDetails;