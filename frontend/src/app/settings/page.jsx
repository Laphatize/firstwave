'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon } from '@heroicons/react/20/solid';
import { BuildingOfficeIcon, PlusIcon } from '@heroicons/react/24/outline';
import Navbar from '@/components/Navbar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserAndOrgs = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          // Fetch organizations
          const orgsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (orgsRes.ok) {
            const orgsData = await orgsRes.json();
            setOrganizations(orgsData);
          }
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrgs();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newOrg)
      });
      
      if (response.ok) {
        const createdOrg = await response.json();
        setOrganizations(prev => [...prev, createdOrg]);
        setShowOrgModal(false);
        setNewOrg({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordError('');
        // Add success message handling here
      } else {
        const data = await response.json();
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setPasswordError('An error occurred while changing password');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-500 to-red-400 bg-clip-text text-transparent">
          <div className="flex items-center gap-2">
            <svg 
              className="w-10 h-10 text-red-500" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" 
              />
            </svg>
            <span>Vyvern</span>
          </div>
        </h1>
      </div>
    );
  }

  return (
    <>
      <div className="bg-neutral-900 min-h-screen">
        <Navbar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <div className="xl:pl-72">
          {/* Sticky search header */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-neutral-900 px-4 shadow-sm sm:px-6 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-white xl:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <main>
            <header className="border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Settings</h1>
            </header>

            <div className="divide-y divide-white/5" key="settings-sections">
              {/* Profile section */}
              <div className="px-4 py-6 sm:px-6 lg:px-8" key="profile-section">
                <div className="mx-auto">
                  <div className="space-y-12">
                    <div className="pb-12">
                      <h2 className="text-base font-semibold leading-7 text-white">Profile</h2>
                      <p className="mt-1 text-sm leading-6 text-neutral-400">
                        Update your personal information and preferences.
                      </p>

                      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                            Email address
                          </label>
                          <div className="mt-2">
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={user?.email}
                              disabled
                              className="block w-full rounded-md border-0 bg-neutral-800/50 py-1.5 px-3 text-white shadow-sm ring-1 ring-inset ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        {/* Password Change Section */}
                        <div className="sm:col-span-4">
                          <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-white">
                            Current Password
                          </label>
                          <div className="mt-2">
                            <input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="block w-full rounded-md border-0 bg-neutral-800/50 py-1.5 px-3 text-white shadow-sm ring-1 ring-inset ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-white">
                            New Password
                          </label>
                          <div className="mt-2">
                            <input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="block w-full rounded-md border-0 bg-neutral-800/50 py-1.5 px-3 text-white shadow-sm ring-1 ring-inset ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-white">
                            Confirm Password
                          </label>
                          <div className="mt-2">
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="block w-full rounded-md border-0 bg-neutral-800/50 py-1.5 px-3 text-white shadow-sm ring-1 ring-inset ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        {passwordError && (
                          <div className="sm:col-span-4">
                            <p className="text-sm text-red-500">{passwordError}</p>
                          </div>
                        )}

                        <div className="sm:col-span-4">
                          <button
                            onClick={handlePasswordChange}
                            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizations section */}
              <div className="px-4 py-6 sm:px-6 lg:px-8" key="organizations-section">
                <div className="mx-auto">
                  <div className="space-y-12">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-semibold leading-7 text-white">Organizations</h2>
                          <p className="mt-1 text-sm leading-6 text-neutral-400">
                            Manage your organizations and team settings.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowOrgModal(true)}
                          className="flex items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                        >
                          <PlusIcon className="h-4 w-4" />
                          New Organization
                        </button>
                      </div>

                      <div className="mt-6 divide-y divide-white/5">
                        {organizations.map((org, index) => (
                          <div key={`org-${org.id || index}-container`} className="py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                                <BuildingOfficeIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-white">{org.name}</h3>
                                <p className="text-sm text-neutral-400">{org.description}</p>
                              </div>
                              <div className="ml-auto">
                                <button className="rounded-md bg-neutral-800 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700">
                                  Manage
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {organizations.length === 0 && (
                          <div key="no-orgs" className="py-4 text-center">
                            <p className="text-sm text-neutral-400">No organizations yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* New Organization Modal */}
      <AnimatePresence>
        {showOrgModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowOrgModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-xl border border-neutral-700 m-4"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">Create New Organization</h3>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg(prev => ({ ...prev, name: e.target.value }))}
                    className="text-white w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter organization name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newOrg.description}
                    onChange={(e) => setNewOrg(prev => ({ ...prev, description: e.target.value }))}
                    className="text-white w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Enter organization description"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOrgModal(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 