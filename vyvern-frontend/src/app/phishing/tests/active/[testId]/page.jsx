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
import Image from 'next/image';


const TestDetails = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useUser();
  const { organization } = useOrganization();
  const params = useParams();   
  const [liveViewMessages, setLiveViewMessages] = useState([]);
  const liveViewRef = useRef(null);
  const router = useRouter();
  const [streamUrl, setStreamUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

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

  const [showDetails, setShowDetails] = useState(false);

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

  useEffect(() => {
    if (!organization || !test) return;
    
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/stream/${params.testId}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = async (event) => {
      try {
        if (event.data instanceof Blob) {
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          
          // Clean up old URL to prevent memory leaks
          if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
          }
          
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      ws.close();
    };
  }, [organization, test, params.testId]);

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
    
    const messageStyles = {
      Agent: 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10',
      'Function Runner': 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10',
      System: isError ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10' : 'border-neutral-500/20 bg-neutral-500/5 hover:bg-neutral-500/10'
    };

    const roleColors = {
      Agent: 'text-yellow-500',
      'Function Runner': 'text-blue-500',
      System: isError ? 'text-red-500' : 'text-neutral-400'
    };

    return (
      <div className={`rounded-lg border ${messageStyles[message.role]} transition-colors duration-150 px-4 py-3 mb-2`}>
        <div className='flex justify-between items-start gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <span className={`text-sm font-medium ${roleColors[message.role]}`}>{message.role}</span>
              <span className='text-neutral-500 text-xs'>{formatTimestamp(message.timestamp)}</span>
            </div>
            <p className='text-neutral-200 text-sm leading-relaxed'>{message.content}</p>
            
            {message.role === 'System' && isError && (
              <>
                <hr className='mt-3 border-red-500/20'/>
                <p className='text-xs mt-2 text-neutral-400'>
                  Tests may terminate due to interfacing errors or ethical constraints. A developer will investigate and resume the test.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseDetails = () => {
    setSelectedMessage(null);
  };

  const handleRestartTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization?.id}/tests/${params.testId}/restart`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to restart test');
      }

      // Refetch test details to update UI
      await fetchTestDetails();
    } catch (error) {
      console.error('Error restarting test:', error);
    }
  };

  const handleFullRestartTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization?.id}/tests/${params.testId}/full-restart`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to restart test');
      }

      await fetchTestDetails();
    } catch (error) {
      console.error('Error restarting test:', error);
    }
  };

  return (
    <SignedIn>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''} ${selectedMessage ? 'blur-background' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />

        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : 'w-full'}`}>
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
                <div className=''>
                        <div className='bg-neutral-800/80 rounded-lg border border-neutral-700/50'>
                  {/* Main Header Row */}
                  <div className='p-4 flex items-center justify-between'>
                    <div className='flex items-center gap-6'>
                      <div>
                        <h2 className="text-xl font-bold dark:text-white capitalize flex items-center gap-3">
                          {test.type.replace(/-/g, ' ')}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${test.state === 'Live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                            {test.state}
                          </span>
                        </h2>
                        <div className='flex items-center gap-3 mt-1'>
                          <p className="text-sm text-neutral-400">ID: <code className='text-neutral-200 bg-neutral-900/50 px-1.5 py-0.5 rounded'>{test.id}</code></p>
                          <button 
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
                          >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                            <svg 
                              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex gap-2'>
                      <Button 
                        color="red"
                        size="sm"
                        className="hover:bg-red-600/90"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Stop Campaign
                      </Button>
                      
                      <Button color="white" size="sm">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Report
                      </Button>
                      
                      <Button 
                        color="white" 
                        onClick={handleRestartTest}
                        disabled={test?.state !== 'FAILED'}
                        size="sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Resume Test
                      </Button>
                      
                      <Button 
                        color="white" 
                        onClick={handleFullRestartTest}
                        disabled={test?.state === 'COMPLETED'}
                        size="sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Full Restart
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  <div className={`border-t border-neutral-700/30 overflow-hidden transition-all duration-300 ease-in-out ${
                    showDetails ? 'max-h-96' : 'max-h-0'
                  }`}>
                    <div className="p-4 grid grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-400 mb-2">Permissions</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(test.permissions).map(([key, value]) => (
                            <span key={key} className={`px-2 py-1 rounded-md text-xs font-medium
                              ${value 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-neutral-400 mb-2">Scope</h3>
                        <p className="text-sm text-neutral-200">{test.scope}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-neutral-400 mb-2">Context</h3>
                        <p className="text-sm text-neutral-200">{test.context || 'No context provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mt-4 bg-neutral-800/50 backdrop-blur-sm col-span-2 rounded-lg border border-neutral-700/50 p-8'>
                  <div className='grid grid-cols-2 gap-6 h-[400px]'>
                    {/* Browser Stream - now takes left column */}
                    <div className="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700/30">
                      <div className="absolute top-0 left-0 right-0 bg-neutral-800/80 backdrop-blur-sm p-3 border-b border-neutral-700/30">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                          </div>
                          <div className="px-3 py-1.5 bg-neutral-900/50 rounded text-neutral-400 text-sm flex-1 text-center">
                            Live Browser Stream
                          </div>
                        </div>
                      </div>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          className="w-full h-full object-contain mt-12"
                          alt="Browser Stream"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-400 mt-[6%]">
                          <Image
                            src="/break.png"
                            alt="Stream Unavailable"
                            width={400}
                            height={140}
                            className="opacity-50 mb-4 w-full h-auto object-contain"
                          />
                          <p className="text-sm hidden">Stream unavailable</p>
                        </div>
                      )}
                    </div>

                    {/* Live Messages - now takes right column */}
                    <div className='bg-neutral-800/80 rounded-xl border border-neutral-700/30 h-[400px] flex flex-col'>
                      <div className='p-4 border-b border-neutral-700/30'>
                        <h2 className='text-neutral-300 font-medium'>Attack Logs</h2>
                      </div>
                      <div 
                        ref={liveViewRef}
                        className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-transparent p-4'
                      >
                        {liveViewMessages.length === 0 ? (
                          <div className='flex flex-col items-center justify-center py-12 text-neutral-500'>
                            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <p className='text-sm'>Waiting for attack logs...</p>
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