'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function TestExecutionModal({ isOpen, onClose, campaign, sessionData }) {
  const [status, setStatus] = useState('initializing');
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const screenshotInterval = useRef(null);
  const statusInterval = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Modal opened:', isOpen);
    console.log('Session data:', sessionData);

    // Clear any existing intervals
    if (statusInterval.current) {
      clearInterval(statusInterval.current);
    }
    if (screenshotInterval.current) {
      clearInterval(screenshotInterval.current);
    }

    if (isOpen && sessionData?.sessionId) {
      console.log('Starting polling with sessionId:', sessionData.sessionId);
      setStatus(sessionData.status || 'initializing');
      setError(null);
      
      // Start polling for status
      statusInterval.current = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/status`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Status update:', data);
            setStatus(data.status);
            
            if (data.status === 'completed' || data.status === 'error') {
              clearInterval(statusInterval.current);
              clearInterval(screenshotInterval.current);
              
              // Cleanup session
              await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/cleanup`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
            }
          } else {
            console.error('Status fetch failed:', await response.text());
            setError('Failed to fetch status');
          }
        } catch (error) {
          console.error('Error fetching status:', error);
          setError('Error fetching status');
        }
      }, 2000);

      // Start screenshot polling
      const pollScreenshot = async () => {
        try {
          const timestamp = Date.now();
          const url = `http://localhost:3001/api/campaigns/${sessionData.sessionId}/screenshot?t=${timestamp}`;
          console.log('Fetching screenshot from:', url);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            console.log('New screenshot received');
            setScreenshotUrl(imageUrl);
          } else {
            console.log('Screenshot not available yet:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching screenshot:', error);
        }
      };

      screenshotInterval.current = setInterval(pollScreenshot, 1000);
      // Initial poll
      pollScreenshot();
    }

    return () => {
      console.log('Cleaning up intervals');
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
      if (screenshotInterval.current) {
        clearInterval(screenshotInterval.current);
      }
      // Clean up any object URLs to prevent memory leaks
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl);
      }
    };
  }, [isOpen, sessionData?.sessionId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative min-h-screen p-8 overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto mt-20">
              <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-700/50">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-100">
                      Test Execution: {campaign?.name}
                    </h2>
                    <p className="text-zinc-400 mt-1">{campaign?.objective}</p>
                    <p className="text-xs text-zinc-500 mt-1">Session ID: {sessionData?.sessionId}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <div className="flex-shrink-0">
                      {status === 'running' ? (
                        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                      ) : status === 'completed' ? (
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                      ) : status === 'error' ? (
                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                      ) : (
                        <div className="w-3 h-3 bg-zinc-400 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-zinc-100 font-medium">
                        Status: {status}
                      </p>
                      {error && (
                        <p className="text-red-400 text-sm mt-1">{error}</p>
                      )}
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-100">Live Preview</h3>
                    <div className="aspect-[4/3] w-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
                      {screenshotUrl ? (
                        <img
                          src={screenshotUrl}
                          alt="Live preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            setScreenshotUrl(null);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-zinc-500">
                            {sessionData?.sessionId ? 'Waiting for preview...' : 'Initializing session...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 