'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function TestExecutionModal({ isOpen, onClose, campaign, sessionData }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && sessionData?.status === 'running') {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, sessionData?.status]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Progress</span>
                        <span className="text-zinc-400">{progress}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      <div className="flex-shrink-0">
                        {sessionData?.status === 'running' ? (
                          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
                        ) : sessionData?.status === 'completed' ? (
                          <div className="w-3 h-3 bg-green-400 rounded-full" />
                        ) : sessionData?.status === 'error' ? (
                          <div className="w-3 h-3 bg-red-400 rounded-full" />
                        ) : (
                          <div className="w-3 h-3 bg-zinc-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-zinc-100 font-medium">
                          Status: {sessionData?.status || 'Initializing'}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Created: {sessionData?.created_at ? new Date(sessionData.created_at).toLocaleString() : 'N/A'}
                        </p>
                        {sessionData?.finished_at && (
                          <p className="text-sm text-zinc-400">
                            Finished: {new Date(sessionData.finished_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Steps Progress */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-zinc-100">Test Steps</h3>
                      <div className="space-y-3">
                        {sessionData?.steps?.map((step) => (
                          <div key={step.id} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                            <div className="flex justify-between items-start">
                              <span className="text-zinc-300 font-medium">Step {step.step}</span>
                            </div>
                            {step.evaluation_previous_goal && (
                              <p className="text-sm text-zinc-400 mt-2">
                                Previous: {step.evaluation_previous_goal}
                              </p>
                            )}
                            {step.next_goal && (
                              <p className="text-sm text-zinc-400 mt-1">
                                Next: {step.next_goal}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Output */}
                    {sessionData?.output && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-zinc-100">Output</h3>
                        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                          <pre className="text-sm text-zinc-400 whitespace-pre-wrap">
                            {sessionData.output}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-100">Live Preview</h3>
                    {sessionData?.live_url ? (
                      <div className="aspect-[4/3] w-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden">
                        <iframe
                          src={sessionData.live_url}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] w-full bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex items-center justify-center">
                        <p className="text-zinc-500">Waiting for live preview...</p>
                      </div>
                    )}
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