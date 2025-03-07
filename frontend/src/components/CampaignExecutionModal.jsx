'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function CampaignExecutionModal({ isOpen, onClose, campaign }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('initializing');

  useEffect(() => {
    if (!isOpen || !campaign) return;

    const startSession = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/campaigns/${campaign._id}/test`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to start campaign test');
        
        setSession(data);
        pollStatus(data.sessionId);
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    };

    const pollStatus = async (sessionId) => {
      try {
        const response = await fetch(`http://localhost:3001/api/campaigns/${campaign._id}/test`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to fetch status');
        
        setStatus(data.status);
        
        if (data.status !== 'completed' && data.status !== 'error') {
          setTimeout(() => pollStatus(sessionId), 5000);
        }
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    };

    startSession();
  }, [isOpen, campaign]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-zinc-900 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-zinc-100">
              Campaign Test: {campaign?.name}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {status === 'initializing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4" />
                <p className="text-zinc-400">Initializing campaign test...</p>
              </div>
            )}

            {status === 'running' && session && (
              <div className="space-y-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-2">Session Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">Session ID</p>
                      <p className="text-sm text-zinc-300">{session.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Status</p>
                      <p className="text-sm text-zinc-300 capitalize">{status}</p>
                    </div>
                  </div>
                </div>

                {session.viewerUrl && (
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-zinc-300 mb-2">Live View</h3>
                    <a
                      href={session.viewerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Open Steel Session Viewer
                    </a>
                  </div>
                )}

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-zinc-300 mb-2">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400">Campaign Progress</p>
                      <div className="flex items-center">
                        <div className="animate-pulse h-2 w-2 rounded-full bg-green-500 mr-2" />
                        <p className="text-sm text-green-500">Live</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400">Campaign test completed successfully!</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400">{error || 'An error occurred while running the campaign test'}</p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 