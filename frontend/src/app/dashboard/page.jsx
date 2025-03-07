'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CampaignExecutionModal from '@/components/CampaignExecutionModal';
import TestExecutionModal from '@/components/TestExecutionModal';
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Navbar from '@/components/Navbar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [step, setStep] = useState(1);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [campaigns, setCampaigns] = useState([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    objective: '',
    linkedinVerified: false,
    testConfig: {
      companyName: '',
      frequency: 'daily',
      notifications: true,
      recipients: []
    }
  });
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [currentRecipient, setCurrentRecipient] = useState({ name: '', email: '', avatar: null });
  const [personSearchLoading, setPersonSearchLoading] = useState(false);
  const [personData, setPersonData] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testSessionData, setTestSessionData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if tutorial has been shown
    const tutorialShown = localStorage.getItem('tutorialShown');
    if (!tutorialShown) {
      setShowTutorialModal(true);
    }

    const fetchUserAndCampaigns = async () => {
      try {
        // Fetch user data
        const userRes = await fetch('http://localhost:3001/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          // Fetch campaigns
          const campaignsRes = await fetch('http://localhost:3001/api/campaigns', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (campaignsRes.ok) {
            const campaignsData = await campaignsRes.json();
            setCampaigns(campaignsData);
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

    fetchUserAndCampaigns();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestConfigChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      testConfig: {
        ...prev.testConfig,
        [name]: value
      }
    }));
  };

  const handleCompanyNameChange = async (e) => {
    const { name, value } = e.target;
    handleTestConfigChange(e);
    
    if (value.length < 3) {
      setCompanyData(null);
      return;
    }

    setCompanySearchLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/company/search?name=${encodeURIComponent(value)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanyData(data);
      }
    } catch (error) {
      console.error('Failed to fetch company data:', error);
    } finally {
      setCompanySearchLoading(false);
    }
  };

  const handleRecipientKeyDown = (e) => {
    if (e.key === 'Enter' && currentRecipient.name && currentRecipient.email) {
      e.preventDefault();
      const newRecipient = {
        name: currentRecipient.name,
        email: currentRecipient.email,
        avatar: personData?.found ? personData.avatar : null,
        employment: personData?.found ? personData.employment : null
      };
      setRecipients(prev => [...prev, newRecipient]);
      setCampaignData(prev => ({
        ...prev,
        testConfig: {
          ...prev.testConfig,
          recipients: [...prev.testConfig.recipients, { name: newRecipient.name, email: newRecipient.email }]
        }
      }));
      setCurrentRecipient({ name: '', email: '', avatar: null });
      setPersonData(null);
    }
  };

  const handleRecipientEmailChange = async (e) => {
    const { value } = e.target;
    setCurrentRecipient(prev => ({ ...prev, email: value }));
    
    if (!value || !value.includes('@')) {
      setPersonData(null);
      setCurrentRecipient(prev => ({ ...prev, avatar: null }));
      return;
    }

    setPersonSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/company/person?email=${encodeURIComponent(value)}${currentRecipient.name ? `&name=${encodeURIComponent(currentRecipient.name)}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonData(data);
        if (data.found) {
          setCurrentRecipient(prev => ({
            ...prev,
            name: data.name || prev.name,
            avatar: data.avatar || null
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch person data:', error);
      setCurrentRecipient(prev => ({ ...prev, avatar: null }));
    } finally {
      setPersonSearchLoading(false);
    }
  };

  const handleRecipientNameChange = async (e) => {
    const { value } = e.target;
    setCurrentRecipient(prev => ({ ...prev, name: value }));
    
    if (!value || value.length < 2) {
      return;
    }

    setPersonSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/company/person?name=${encodeURIComponent(value)}${currentRecipient.email ? `&email=${encodeURIComponent(currentRecipient.email)}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonData(data);
        if (data.found && data.nameMatches) {
          setCurrentRecipient(prev => ({
            ...prev,
            avatar: data.avatar || null
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch person data:', error);
    } finally {
      setPersonSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(campaignData)
      });
      
      if (response.ok) {
        const newCampaign = await response.json();
        setCampaigns(prev => [newCampaign, ...prev]);
        setShowModal(false);
        setStep(1);
        setCampaignData({
          name: '',
          description: '',
          objective: '',
          linkedinVerified: false,
          testConfig: {
            companyName: '',
            frequency: 'daily',
            notifications: true,
            recipients: []
          }
        });
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCampaigns(prev => prev.filter(campaign => campaign._id !== campaignId));
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleRunTest = async (campaignId) => {
    if (!campaignId) return;
    
    try {
      setShowTestModal(true);
      const response = await fetch(`http://localhost:3001/api/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Test started with data:', data);
        setTestSessionData(data);
      } else {
        console.error('Failed to start test:', await response.text());
      }
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleTestButtonClick = (campaign) => {
    if (!campaign) return;
    setSelectedCampaign(campaign);
    handleRunTest(campaign._id);
  };

  const handleCloseTutorial = () => {
    localStorage.setItem('tutorialShown', 'true');
    setShowTutorialModal(false);
  };

  const renderModalContent = () => {
    return (
      <motion.div
        key={step}
        initial={{ x: step === 1 ? 50 : -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: step === 1 ? -50 : 50, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="w-full"
      >
        {step === 1 ? (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                value={campaignData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={campaignData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                placeholder="Enter campaign description"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Next: Configure Test
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Company Name
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      name="companyName"
                      value={campaignData.testConfig.companyName}
                      onChange={handleCompanyNameChange}
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter company name"
                      required
                    />
                    <div className="absolute right-3 top-2.5">
                      {companySearchLoading ? (
                        <svg className="animate-spin h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg 
                          className="w-4 h-4 text-neutral-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {companyData && (
                    <div className="p-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {companyData.found ? (
                          <>
                            {companyData.logo && (
                              <img 
                                src={companyData.logo} 
                                alt={`${companyData.name} logo`}
                                className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/48?text=' + encodeURIComponent(companyData.name.charAt(0));
                                }}
                              />
                            )}
                            <div>
                              <h4 className="font-medium text-neutral-100">{companyData.name}</h4>
                              <p className="text-sm text-neutral-400">{companyData.domain}</p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full">
                            <div className="flex items-center gap-2 text-amber-400">
                              <p className="text-sm">{companyData.message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Recipients
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={currentRecipient.name}
                      onChange={handleRecipientNameChange}
                      className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email"
                        value={currentRecipient.email}
                        onChange={handleRecipientEmailChange}
                        onKeyDown={handleRecipientKeyDown}
                        className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {personSearchLoading && (
                        <div className="absolute right-3 top-2.5">
                          <svg className="animate-spin h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentRecipient.name && currentRecipient.email && (
                    <div className="p-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {currentRecipient.avatar ? (
                          <img 
                            src={currentRecipient.avatar} 
                            alt={`${currentRecipient.name}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentRecipient.name)}&background=ef4444&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <span className="text-red-400 font-medium text-sm">
                              {currentRecipient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-neutral-100">{currentRecipient.name}</h4>
                          <p className="text-sm text-neutral-400 truncate w-2/3">{currentRecipient.email}</p>
                          {personData?.found && personData.employment && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {personData.employment.title} at {personData.employment.name}
                            </p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <p className="text-[10px] text-neutral-500">Press Enter to add</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-2 px-2 py-1 bg-neutral-900/50 border border-neutral-700/50 rounded-lg"
                      >
                        {recipient.avatar ? (
                          <img 
                            src={recipient.avatar} 
                            alt={`${recipient.name}'s avatar`}
                            className="w-6 h-6 rounded-full object-cover bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name)}&background=ef4444&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <span className="text-red-400 font-medium text-xs">
                              {recipient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm text-neutral-100">{recipient.name}</span>
                          {recipient.employment ? (
                            <span className="text-xs text-neutral-500">{recipient.employment.title}</span>
                          ) : (
                            <span className="text-xs text-neutral-500">{recipient.email}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setRecipients(prev => prev.filter((_, i) => i !== index))}
                          className="ml-1 p-0.5 text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-neutral-500 mt-1">
                    Press Enter after entering both name and email to add a recipient
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">
                  Test Frequency
                </label>
                <select
                  name="frequency"
                  value={campaignData.testConfig.frequency}
                  onChange={handleTestConfigChange}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={campaignData.testConfig.notifications}
                  onChange={(e) => handleTestConfigChange({
                    target: {
                      name: 'notifications',
                      value: e.target.checked
                    }
                  })}
                  className="rounded border-neutral-700 text-red-500 focus:ring-red-500"
                />
                <label className="text-sm text-neutral-400">
                  Enable notifications
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Next: Set Objective
              </button>
            </div>
          </form>
        ) : step === 3 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">
                Campaign Objective
              </label>
              <div className="space-y-3">
                <textarea
                  name="objective"
                  value={campaignData.objective}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="6"
                  placeholder="Describe what information or access you want the AI to obtain through social engineering (e.g., 'Gain access to internal documentation' or 'Obtain information about the company's security protocols')"
                  required
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-700/50 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-400">
                    <p className="text-sm">
                      Be specific about your objective. This helps the AI better understand what information to seek during the campaign.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Next: Verify LinkedIn
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="space-y-3">
                <div className="items-center gap-3">
                  <div className="flex align-middle justify-center">
                    <img src="../qr.png" className="w-32 h-32 bg-white p-2 rounded-lg" />
                    <div className="ml-4 mt-4">
                      <h1 className="text-neutral-100">Connect with Pranav Ramesh on LinkedIn to continue.</h1>
                      <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600" onClick={() => window.open('https://www.linkedin.com/in/pranavramesh2', '_blank')}>Connect</button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="linkedinVerified"
                        checked={campaignData.linkedinVerified}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          linkedinVerified: e.target.checked
                        }))}
                        className="rounded border-neutral-700 text-red-500 focus:ring-red-500"
                      />
                      <label htmlFor="linkedinVerified" className="text-sm text-neutral-300">
                        I confirm that I have connected with Pranav Ramesh on LinkedIn
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">
                      This step is required to ensure the campaign's effectiveness and authenticity.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!campaignData.linkedinVerified}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  campaignData.linkedinVerified
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                }`}
              >
                Create Campaign
              </button>
            </div>
          </form>
        )}
      </motion.div>
    );
  };

  const renderTutorialContent = () => {
    return (
      <motion.div
        key={tutorialStep}
        initial={{ x: tutorialStep === 1 ? 50 : -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: tutorialStep === 1 ? -50 : 50, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="w-full"
      >
        {tutorialStep === 1 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <FolderIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white text-center">Welcome to Campaigns</h3>
            <p className="text-sm text-neutral-400 text-center">
              Campaigns are your test schedules. They help you organize and automate your security testing.
            </p>

            {/* Interactive Campaign Demo */}
            <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
              <div className="bg-neutral-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <FolderIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Example Campaign</h4>
                      <p className="text-xs text-neutral-400">Tech Corp Inc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
                      <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                    </div>
                    <span className="text-xs text-neutral-400">Active</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <span className="text-neutral-300">3 Recipients</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-neutral-300">Daily Tests</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <svg className="w-4 h-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                      </svg>
                    </div>
                    <span className="text-neutral-300">85% Success Rate</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors">
                    Run Test
                  </button>
                  <button className="text-xs bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-md hover:bg-neutral-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <ServerIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white text-center">Understanding Tests</h3>
            <p className="text-sm text-neutral-400 text-center">
              Tests are the actual security assessments performed based on your campaign settings.
            </p>

            {/* Interactive Test Demo */}
            <div className="rounded-lg border border-neutral-700/50 overflow-hidden">
              <div className="bg-neutral-900 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <ServerIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Active Test</h4>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-xs text-neutral-400">Running...</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-neutral-200">Initial Contact Made</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-neutral-200">Response Received</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-red-500 border-r-transparent animate-spin" />
                      </div>
                      <span className="text-sm text-neutral-200">Analyzing Response</span>
                    </div>
                  </div>

                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-400">Progress</span>
                      <span className="text-xs text-neutral-400">67%</span>
                    </div>
                    <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="text-xs bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-md hover:bg-neutral-700 transition-colors w-full">
                    View Live Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          {tutorialStep === 1 ? (
            <button
              type="button"
              onClick={() => setTutorialStep(2)}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Next: Learn about Tests
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCloseTutorial}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      </motion.div>
    );
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

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form className="flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-neutral-500"
                    aria-hidden="true"
                  />
                  <input
                    id="search-field"
                    className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                    placeholder="Search..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
          </div>

          <main className="lg:pr-96">
            <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Campaigns</h1>
              <button
                onClick={() => setShowModal(true)}
                className="group px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 flex items-center gap-2"
              >
                <svg 
                  className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-90"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-white font-medium text-sm">New Campaign</span>
              </button>
            </header>

            {/* Campaign list */}
            <div className="divide-y divide-white/5">
              {campaigns.map((campaign) => (
                <div
                  key={campaign._id}
                  className="group px-4 py-6 sm:px-6 lg:px-8 hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <div className="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                      <h2 className="min-w-0 text-sm font-semibold leading-6 text-white">
                        <a href="#" className="flex gap-x-2">
                          <span className="truncate">{campaign.name}</span>
                          <span className="text-neutral-400">/</span>
                          <span className="whitespace-nowrap">{campaign.testConfig.companyName}</span>
                        </a>
                      </h2>
                    </div>
                    <div className="flex flex-none items-center gap-x-4">
                      <button
                        onClick={() => handleTestButtonClick(campaign)}
                        className="hidden rounded-md bg-red-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 group-hover:block"
                      >
                        Run Test
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign._id)}
                        className="hidden rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 group-hover:block"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-neutral-400">
                    <p className="truncate">{campaign.description}</p>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-neutral-300">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <p className="whitespace-nowrap">{campaign.testConfig.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Keep existing modals */}
      <AnimatePresence mode="wait">
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
              <h3 className="text-xl font-semibold mb-4 text-white">
                {step === 1 ? 'Create New Campaign' : step === 2 ? 'Configure Test Settings' : 'Verify LinkedIn'}
              </h3>
              {renderModalContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TestExecutionModal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestSessionData(null);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        sessionData={testSessionData}
      />

      {/* Tutorial Modal */}
      <AnimatePresence mode="wait">
        {showTutorialModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-neutral-800 rounded-xl p-6 shadow-xl border border-neutral-700 m-4"
            >
              {renderTutorialContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 