'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingOfficeIcon, PlusIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function OrganizationOnboarding({ onOrganizationCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('select'); // 'select', 'create', or 'join'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowModal(false);
        if (onOrganizationCreated) {
          onOrganizationCreated(data);
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to create organization');
      }
    } catch (error) {
      setError('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          inviteCode: formData.inviteCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowModal(false);
        if (onOrganizationCreated) {
          onOrganizationCreated(data);
        }
      } else {
        const error = await response.json();
        setError(error.message || 'Invalid invite code');
      }
    } catch (error) {
      setError('Failed to join organization');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'create':
        return (
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter organization name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                placeholder="Enter organization description"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        );

      case 'join':
        return (
          <form onSubmit={handleJoinOrg} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Invite Code
              </label>
              <input
                type="text"
                value={formData.inviteCode}
                onChange={(e) => setFormData(prev => ({ ...prev, inviteCode: e.target.value }))}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter invite code"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setMode('select')}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Organization'}
              </button>
            </div>
          </form>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white">Get Started</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Create a new organization or join an existing one
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setMode('create')}
                className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:bg-neutral-800 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-red-500/10">
                  <PlusIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-medium text-white">Create Organization</h4>
                  <p className="text-xs text-neutral-400">Start a new organization from scratch</p>
                </div>
              </button>
              <button
                onClick={() => setMode('join')}
                className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 hover:bg-neutral-800 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-red-500/10">
                  <KeyIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-sm font-medium text-white">Join Organization</h4>
                  <p className="text-xs text-neutral-400">Join using an invite code</p>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-xl bg-red-500/10 mb-6">
          <BuildingOfficeIcon className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No Organizations</h2>
        <p className="text-neutral-400 text-sm mb-6">
          You're not part of any organizations yet. Create one or join an existing organization.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Get Started</span>
        </button>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-xl border border-neutral-700 m-4"
            >
              {renderContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 