'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function TestExecutionModal({ isOpen, onClose, campaign, sessionData }) {
  const [status, setStatus] = useState('initializing');
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const screenshotInterval = useRef(null);
  const statusInterval = useRef(null);
  const messagesInterval = useRef(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [lastScreenshotTime, setLastScreenshotTime] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'sent':
        return 'items-end bg-indigo-500/10 border border-indigo-500/20';
      case 'received':
        return 'items-start bg-zinc-700/30 border border-zinc-600/20';
      case 'system':
        return 'items-center bg-amber-500/10 border border-amber-500/20 text-amber-400';
      default:
        return 'items-start bg-zinc-700/30 border border-zinc-600/20';
    }
  };

  // Start messages polling
  const pollMessages = async () => {
    if (!sessionData?.sessionId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (JSON.stringify(data.messages) !== JSON.stringify(messages)) {
          setMessages(data.messages);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Start screenshot polling
  const pollScreenshot = async () => {
    if (!sessionData?.sessionId) return;
    
    try {
      const currentTime = Date.now();
      // Only fetch if more than 250ms has passed since last successful fetch
      if (currentTime - lastScreenshotTime < 250) return;
      
      const timestamp = currentTime;
      const url = `http://localhost:3001/api/campaigns/${sessionData.sessionId}/screenshot?t=${timestamp}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        // Only update if we got a valid image
        if (blob.size > 0) {
          const newImageUrl = URL.createObjectURL(blob);
          setScreenshotUrl(prevUrl => {
            if (prevUrl) {
              URL.revokeObjectURL(prevUrl);
            }
            return newImageUrl;
          });
          setLastScreenshotTime(currentTime);
        }
      }
    } catch (error) {
      console.error('Error fetching screenshot:', error);
    }
  };

  useEffect(() => {
    console.log('Modal opened:', isOpen);
    console.log('Session data:', sessionData);

    // Clear any existing intervals
    if (statusInterval.current) clearInterval(statusInterval.current);
    if (screenshotInterval.current) clearInterval(screenshotInterval.current);
    if (messagesInterval.current) clearInterval(messagesInterval.current);

    if (isOpen && sessionData?.sessionId) {
      console.log('Starting polling with sessionId:', sessionData.sessionId);
      setStatus(sessionData.status || 'initializing');
      setError(null);
      
      // Start polling for status
      statusInterval.current = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/status`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setStatus(data.status);
            
            if (data.status === 'completed' || data.status === 'error') {
              // Do one final screenshot poll before cleanup
              await pollScreenshot();
              
              clearInterval(statusInterval.current);
              clearInterval(screenshotInterval.current);
              clearInterval(messagesInterval.current);
              
              // Cleanup session
              await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/cleanup`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
            }
          }
        } catch (error) {
          console.error('Error fetching status:', error);
          setError('Error fetching status');
        }
      }, 2000);

      // More frequent screenshot polling (every 250ms)
      screenshotInterval.current = setInterval(pollScreenshot, 250);
      messagesInterval.current = setInterval(pollMessages, 1000);
      
      // Initial polls
      pollScreenshot();
      pollMessages();
    }

    return () => {
      console.log('Cleaning up intervals');
      if (statusInterval.current) clearInterval(statusInterval.current);
      if (screenshotInterval.current) clearInterval(screenshotInterval.current);
      if (messagesInterval.current) clearInterval(messagesInterval.current);
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [isOpen, sessionData?.sessionId]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

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

                <div className="grid grid-cols-2 gap-6">
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

                  {/* Message History */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-100">Message History</h3>
                    <div className="h-[600px] bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-4 overflow-y-auto">
                      <div className="space-y-4">
                        {messages.length > 0 ? (
                          messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex flex-col ${
                                message.type === 'system' ? 'items-center' : 
                                message.type === 'sent' ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${getMessageStyle(message.type)}`}
                              >
                                <p className="text-sm text-zinc-100">{message.text}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {formatTimestamp(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-zinc-500">Initializing session...</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
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