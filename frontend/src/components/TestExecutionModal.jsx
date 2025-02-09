'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ErrorBoundary } from 'react-error-boundary';
import { usePathname } from 'next/navigation';

// Add Error Fallback component
function ErrorFallback() {
  return null; // Return empty to hide errors
}

export default function TestExecutionModal({ isOpen, onClose, campaign, sessionData }) {
  const pathname = usePathname();
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const screenshotInterval = useRef(null);
  const messagesInterval = useRef(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [lastScreenshotTime, setLastScreenshotTime] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);

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

  // Disable screenshot polling by making it a no-op
  const pollScreenshot = async () => {
    // Screenshot polling disabled
    return;
  };

  // Add sync function
  const syncMessages = async () => {
    if (!sessionData?.sessionId) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error syncing messages:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const generateReport = async () => {
    if (!sessionData?.sessionId) return;
    
    setIsGeneratingReport(true);
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/analysis`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setShowReport(true);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const askFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || !sessionData?.sessionId) return;
    
    setIsAskingFollowUp(true);
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/analysis/followup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: followUpQuestion })
      });

      if (response.ok) {
        const data = await response.json();
        setFollowUpHistory(prev => [...prev, data]);
        setFollowUpQuestion('');
      }
    } catch (error) {
      console.error('Error asking follow-up:', error);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const downloadPdfReport = async () => {
    if (!sessionData?.sessionId) return;
    
    setIsDownloadingPdf(true);
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${sessionData.sessionId}/analysis/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phishing-analysis-${sessionData.sessionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    console.log('Modal opened:', isOpen);
    console.log('Session data:', sessionData);

    // Clear any existing intervals
    if (screenshotInterval.current) clearInterval(screenshotInterval.current);
    if (messagesInterval.current) clearInterval(messagesInterval.current);

    if (isOpen && sessionData?.sessionId) {
      console.log('Starting polling with sessionId:', sessionData.sessionId);
      setError(null);
      
      // Only set up message polling, screenshot polling disabled
      messagesInterval.current = setInterval(pollMessages, 1000);
      
      // Initial message poll
      pollMessages();
    }

    return () => {
      console.log('Cleaning up intervals');
      if (screenshotInterval.current) clearInterval(screenshotInterval.current);
      if (messagesInterval.current) clearInterval(messagesInterval.current);
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [isOpen, sessionData?.sessionId]);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setVideoStream(stream);
          }
        })
        .catch(err => console.error('Error accessing camera:', err));
    } else if (videoStream) {
      // Cleanup video stream when modal closes
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  }, [isOpen]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
                      {/* Live Preview */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-zinc-100">Live Preview</h3>
                        <div className="aspect-[4/3] w-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
                          {isOpen ? (
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-zinc-500">Camera preview unavailable</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Analysis Report Button */}
                      <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={generateReport}
                            disabled={isGeneratingReport || !sessionData?.sessionId}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isGeneratingReport || !sessionData?.sessionId
                                ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                            }`}
                          >
                            {isGeneratingReport ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Generate Report
                              </>
                            )}
                          </button>

                          {report && (
                            <button
                              onClick={downloadPdfReport}
                              disabled={isDownloadingPdf}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDownloadingPdf
                                  ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {isDownloadingPdf ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                  Download PDF
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Analysis Report Modal */}
                      <AnimatePresence>
                        {showReport && report && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                          >
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReport(false)} />
                            <div className="relative w-full max-w-6xl  overflow-y-hidden  overflow-x-hidden bg-zinc-900 rounded-xl p-8 border border-zinc-700/50 overflow-y-auto max-h-[80vh]">
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-bold text-zinc-100">Analysis Report</h3>
                                <button
                                  onClick={() => setShowReport(false)}
                                  className="p-2 text-zinc-400 hover:text-zinc-300 transition-colors"
                                >
                                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="space-y-6">
                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                  <div>Generated: {new Date(report.timestamp).toLocaleString()}</div>
                                  <div>Messages Analyzed: {report.messageCount}</div>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                  <div className="whitespace-pre-wrap font-mono text-sm bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    {report.analysis}
                                  </div>
                                </div>

                                {/* Follow-up Questions Section */}
                                <div className="space-y-4 mt-8">
                                  <h4 className="text-lg font-medium text-zinc-100">Follow-up Questions</h4>
                                  
                                  {/* Follow-up History */}
                                  <div className="space-y-4">
                                    {followUpHistory.map((item, index) => (
                                      <div key={index} className="space-y-2">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                            <svg className="w-4 h-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                            </svg>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-200">{item.question}</p>
                                            <div className="mt-2 prose prose-invert prose-sm max-w-none">
                                              <ReactMarkdown
                                                className="text-sm text-zinc-300"
                                                components={{
                                                  p: ({ children }) => <p className="text-zinc-300">{children}</p>,
                                                  a: ({ children, href }) => (
                                                    <a href={href} className="text-indigo-400 hover:text-indigo-300" target="_blank" rel="noopener noreferrer">
                                                      {children}
                                                    </a>
                                                  ),
                                                  ul: ({ children }) => <ul className="list-disc pl-4 mt-2">{children}</ul>,
                                                  ol: ({ children }) => <ol className="list-decimal pl-4 mt-2">{children}</ol>,
                                                  li: ({ children }) => <li className="mt-1">{children}</li>,
                                                  code: ({ children }) => (
                                                    <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-xs">
                                                      {children}
                                                    </code>
                                                  ),
                                                }}
                                              >
                                                {item.answer}
                                              </ReactMarkdown>
                                            </div>
                                            <p className="text-xs text-zinc-500 mt-2">
                                              {new Date(item.timestamp).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Ask Follow-up Form */}
                                  <form onSubmit={askFollowUp} className="mt-4">
                                    <div className="flex gap-3">
                                      <input
                                        type="text"
                                        value={followUpQuestion}
                                        onChange={(e) => setFollowUpQuestion(e.target.value)}
                                        placeholder="Ask a follow-up question about the analysis..."
                                        className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        disabled={isAskingFollowUp}
                                      />
                                      <button
                                        type="submit"
                                        disabled={isAskingFollowUp || !followUpQuestion.trim()}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                          isAskingFollowUp || !followUpQuestion.trim()
                                            ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                        }`}
                                      >
                                        {isAskingFollowUp ? (
                                          <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                          </>
                                        ) : (
                                          <>
                                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                                            </svg>
                                            Ask
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Message History */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-zinc-100">Message History</h3>
                        <button
                          onClick={syncMessages}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20'
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          {isSyncing ? 'Syncing...' : 'Sync Messages'}
                        </button>
                      </div>
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
    </ErrorBoundary>
  );
} 