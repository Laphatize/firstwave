/*


 THIS IS WHAT IS BEING USED FOR THE TEST A CAMPAIGN FEATURE 
 DO NOT CONFUSE WITH CAMPAIGN EXECUTION MODAL (ACCESSED VIA NEW CAMPAIGN BUTTON)
*/



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
  const [isEndingCampaign, setIsEndingCampaign] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'sent':
        return 'items-end bg-red-500/10 border border-red-500/20';
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${sessionData.sessionId}/messages`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${sessionData.sessionId}/messages`, {
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

  // Merged function to generate and download report
  const generateAndDownloadReport = async () => {
    if (!sessionData?.sessionId) return;
    
    setIsGeneratingReport(true);
    try {
      // First generate the report
      const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${sessionData.sessionId}/analysis`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (analysisResponse.ok) {
        const data = await analysisResponse.json();
        setReport(data);
        setShowReport(true);

        // Then immediately download the PDF
        const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${sessionData.sessionId}/analysis/pdf`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `phishing-analysis-${sessionData.sessionId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error generating and downloading report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const askFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || !sessionData?.sessionId) return;
    
    setIsAskingFollowUp(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${sessionData.sessionId}/analysis/followup`, {
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

  // Add end campaign function
  const endCampaign = async () => {
    if (!sessionData?.sessionId) return;
    
    setIsEndingCampaign(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${sessionData.sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        onClose(); // Close the modal after successfully ending the campaign
      }
    } catch (error) {
      console.error('Error ending campaign:', error);
    } finally {
      setIsEndingCampaign(false);
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

      setInterval(async () => {
        const screenshot = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/screenshot/${sessionData.sessionId}`);
        console.log(screenshot);
        setVideoStream(screenshot);
 

      }, 1000);
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
              className="fixed inset-0 overflow-y-auto"
            >
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
                
                <div className="relative w-full max-w-4xl bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-700/50">
                    <div className="px-6 py-4 flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-zinc-100">
                          Test Execution: {campaign?.name}
                        </h2>
                        <p className="text-zinc-400 mt-1">{campaign?.objective}</p>
                        <p className="text-xs text-zinc-500 mt-1">Session ID: {sessionData?.sessionId}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={endCampaign}
                          disabled={isEndingCampaign || !sessionData?.sessionId}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isEndingCampaign || !sessionData?.sessionId
                              ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {isEndingCampaign ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Ending...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              End Campaign
                            </>
                          )}
                        </button>
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
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Live Preview */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-zinc-100">Live Preview</h3>
                      <div className="aspect-video w-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
                        {isOpen ? (
                          <img
                            src={videoStream}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <p className="text-zinc-500">Connecting to stream...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Analysis Report Button */}
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={generateAndDownloadReport}
                          disabled={isGeneratingReport || !sessionData?.sessionId}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isGeneratingReport || !sessionData?.sessionId
                              ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {isGeneratingReport ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating Report...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              Generate & Download Report
                            </>
                          )}
                        </button>
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