'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BuildingOfficeIcon, UserGroupIcon, ChartBarIcon, ClockIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';

function AnimatedIcon() {
  const icons = [
    {
      icon: BuildingOfficeIcon,
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: ChartBarIcon,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: UserGroupIcon,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: ClockIcon,
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: ShieldCheckIcon,
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="relative w-20 h-20">
      {icons.map((IconData, index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${IconData.gradient} flex items-center justify-center shadow-2xl`}
          initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1, 0.8],
            rotate: [-20, 0, 0, 20]
          }}
          transition={{
            duration: 1.8,
            times: [0, 0.1, 0.9, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
            delay: index * 2.3
          }}
        >
          <IconData.icon className="w-12 h-12 text-white" />
        </motion.div>
      ))}
    </div>
  );
}

function AuthStatus({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
      >
        Logout
      </button>
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700">
        <span className="text-sm text-neutral-300">{user?.email}</span>
        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <UserCircleIcon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function IntroScreen({ onComplete }) {
  return (
    <motion.div 
      className="fixed inset-0 bg-neutral-900 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <motion.button
        onClick={onComplete}
        className="z-50 absolute top-4 right-4 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors rounded-md border border-neutral-700/50 bg-neutral-800/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Skip intro
      </motion.button>

      {/* Main content */}
      <div className="relative text-center space-y-8 max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <div className="mb-6 mx-auto flex justify-center">
            <AnimatedIcon />
          </div>

          <motion.h1 
            className="text-7xl font-bold tracking-tight text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            The future of your organization's HRM
          </motion.h1>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-4 text-5xl font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <motion.span 
            className="text-neutral-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            starts with
          </motion.span>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 1.6,
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
          >
            <img src="../trans_logo.png" alt="Vyvern Logo" className="w-40" />
          </motion.div>
        </motion.div>
      </div>

      {/* Exit animation trigger */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3.5, duration: 1 }}
        onAnimationComplete={onComplete}
        className="absolute inset-0"
      />
    </motion.div>
  );
}

export default function Setup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showJoinOrgModal, setShowJoinOrgModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const userRes = await fetch('http://localhost:3001/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          
          // If user already has organizations, redirect to dashboard
          if (userData.organizations && userData.organizations.length > 0) {
            router.push('/dashboard');
          }
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newOrg)
      });
      
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ inviteCode })
      });
      
      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to join organization:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900">
        <AuthStatus user={user} />
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
      <AnimatePresence>
        {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>
      <motion.div 
        className="relative min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <AuthStatus user={user} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md w-full space-y-8 text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <motion.img 
              src="../trans_logo.png" 
              alt="Vyvern Logo" 
              className="w-40 mx-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 1.8,
                type: "spring",
                stiffness: 200
              }}
            />
            <motion.p 
              className="mt-2 text-sm text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
            >
              Get started by either creating a new organization or joining an existing one
            </motion.p>
          </motion.div>

          <motion.div 
            className="mt-8 space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  delayChildren: 1.2,
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.button
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              onClick={() => setShowCreateOrgModal(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BuildingOfficeIcon className="h-5 w-5" />
              Create New Organization
            </motion.button>

            <motion.button
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              onClick={() => setShowJoinOrgModal(true)}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-neutral-700 text-sm font-medium rounded-lg text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserGroupIcon className="h-5 w-5" />
              Join Existing Organization
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Create Organization Modal */}
      <AnimatePresence>
        {showCreateOrgModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateOrgModal(false)}
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
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
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
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    rows="3"
                    placeholder="Enter organization description"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateOrgModal(false)}
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

      {/* Join Organization Modal */}
      <AnimatePresence>
        {showJoinOrgModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowJoinOrgModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-xl border border-neutral-700 m-4"
            >
              <h3 className="text-xl font-semibold mb-4 text-white">Join Organization</h3>
              <form onSubmit={handleJoinOrg} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                    placeholder="Enter organization invite code"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowJoinOrgModal(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Join Organization
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