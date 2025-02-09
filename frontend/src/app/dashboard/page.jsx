'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CampaignExecutionModal from '@/components/CampaignExecutionModal';
import TestExecutionModal from '@/components/TestExecutionModal';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
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
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                value={campaignData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={campaignData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Enter campaign description"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Next: Configure Test
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Company Name
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      name="companyName"
                      value={campaignData.testConfig.companyName}
                      onChange={handleCompanyNameChange}
                      className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter company name"
                      required
                    />
                    <div className="absolute right-3 top-2.5">
                      {companySearchLoading ? (
                        <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg 
                          className="w-4 h-4 text-zinc-500"
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
                    <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
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
                              <h4 className="font-medium text-zinc-100">{companyData.name}</h4>
                              <p className="text-sm text-zinc-400">{companyData.domain}</p>
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
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Recipients
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={currentRecipient.name}
                      onChange={handleRecipientNameChange}
                      className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email"
                        value={currentRecipient.email}
                        onChange={handleRecipientEmailChange}
                        onKeyDown={handleRecipientKeyDown}
                        className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {personSearchLoading && (
                        <div className="absolute right-3 top-2.5">
                          <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentRecipient.name && currentRecipient.email && (
                    <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {currentRecipient.avatar ? (
                          <img 
                            src={currentRecipient.avatar} 
                            alt={`${currentRecipient.name}'s avatar`}
                            className="w-10 h-10 rounded-full object-cover bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentRecipient.name)}&background=6366f1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <span className="text-indigo-400 font-medium text-sm">
                              {currentRecipient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-zinc-100">{currentRecipient.name}</h4>
                          <p className="text-sm text-zinc-400 truncate w-2/3">{currentRecipient.email}</p>
                          {personData?.found && personData.employment && (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {personData.employment.title} at {personData.employment.name}
                            </p>
                          )}
                        </div>
                        <div className="ml-auto ">
                          <p className="text-[10px] text-zinc-500">Press Enter to add</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-2 px-2 py-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg"
                      >
                        {recipient.avatar ? (
                          <img 
                            src={recipient.avatar} 
                            alt={`${recipient.name}'s avatar`}
                            className="w-6 h-6 rounded-full object-cover bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name)}&background=6366f1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <span className="text-indigo-400 font-medium text-xs">
                              {recipient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm text-zinc-100">{recipient.name}</span>
                          {recipient.employment ? (
                            <span className="text-xs text-zinc-500">{recipient.employment.title}</span>
                          ) : (
                            <span className="text-xs text-zinc-500">{recipient.email}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setRecipients(prev => prev.filter((_, i) => i !== index))}
                          className="ml-1 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-zinc-500 mt-1">
                    Press Enter after entering both name and email to add a recipient
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Test Frequency
                </label>
                <select
                  name="frequency"
                  value={campaignData.testConfig.frequency}
                  onChange={handleTestConfigChange}
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500"
                />
                <label className="text-sm text-zinc-400">
                  Enable notifications
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Next: Set Objective
              </button>
            </div>
          </form>
        ) : step === 3 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Campaign Objective
              </label>
              <div className="space-y-3">
                <textarea
                  name="objective"
                  value={campaignData.objective}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900/50 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="6"
                  placeholder="Describe what information or access you want the AI to obtain through social engineering (e.g., 'Gain access to internal documentation' or 'Obtain information about the company's security protocols')"
                  required
                />
                <div className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg">
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
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Next: Verify LinkedIn
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            
              <div className="space-y-3">
                  <div className=" items-center gap-3">
                    <div className="flex align-middle justify-center">
                 <img src="../qr.png" className="w-32 h-32 bg-white p-2 rounded-lg" />
           <div className=" ml-4 mt-4">
                 <h1 className="text-zinc-100">Connect with Pranav Ramesh on LinkedIn to continue.</h1>
                   <button className="mt-2  bg-indigo-500 text-white px-4 py-2 rounded-md" onClick={() => window.open('https://www.linkedin.com/in/pranavramesh2', '_blank')}>Connect</button>
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
                        className="rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500"
                      />
                      <label htmlFor="linkedinVerified" className="text-sm text-zinc-300">
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
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!campaignData.linkedinVerified}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  campaignData.linkedinVerified
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            <div className="flex items-center gap-2">
              <svg 
                className="w-10 h-10 text-white" 
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
              <span>Firstwave</span>
            </div>
          </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 p-8 text-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <svg 
                  className="w-8 h-8 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Firstwave</span>
            </div>
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-indigo-400/80">Welcome back</p>
                <h2 className="text-3xl font-bold text-zinc-100">
                  {user?.email.split('@')[0]}
                  <span className="text-zinc-500 text-xl ml-1">
                    @{user?.email.split('@')[1]}
                  </span>
                </h2>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-1 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
                <p className="text-sm text-zinc-500">Member since</p>
                <p className="text-indigo-400 font-medium">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="space-y-1 p-4 rounded-lg bg-zinc-900/50 border border-zinc-700/30">
                <p className="text-sm text-zinc-500">Account Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-green-400 font-medium">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <svg 
                  className="w-5 h-5 text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
              </div>
              <h2 className='text-2xl font-semibold text-zinc-100'>
                Test a campaign
              </h2>
            </div>

            <div className='space-y-6'>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-400">Campaign</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-zinc-900/50 border border-zinc-700/30 rounded-lg px-3 py-2.5 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 pr-10"
                      defaultValue=""
                      onChange={(e) => {
                        const selected = campaigns.find(c => c._id === e.target.value);
                        setSelectedCampaign(selected);
                      }}
                    >
                      <option value="" disabled>Select Campaign</option>
                      {campaigns.map(campaign => (
                        <option key={campaign._id} value={campaign._id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

     
              </div>

              <div className="grid grid-cols-1 gap-6">
      

                <div className="flex items-end">  
                  <button 
                    onClick={() => handleTestButtonClick(selectedCampaign)}
                    disabled={isTestRunning || !selectedCampaign}
                    className={`relative w-full ${
                      !selectedCampaign 
                        ? 'bg-indigo-500/50 cursor-not-allowed' 
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white rounded-lg px-4 py-2.5 transition-all duration-300 flex items-center justify-center gap-2 font-medium overflow-hidden`}
                  >
                    {isTestRunning && (
                      <div className="absolute inset-0 bg-indigo-600">
                        <div 
                          className="absolute inset-0 bg-indigo-400"
                          style={{
                            animation: 'progress 2s linear',
                            width: '100%',
                            transformOrigin: 'left',
                          }}
                        />
                      </div>
                    )}
                    <svg 
                      className="w-4 h-4 relative z-10"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" />
                    </svg>
                    <span className="relative z-10">
                      {isTestRunning ? 'Running Test...' : 'Run Test'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-300">
          <div className="flex justify-between items-center text-zinc-400">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 rounded-xl border border-indigo-500/20">
                <svg 
                  className="w-5 h-5 text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100">Active Campaigns</h2>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="group px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center gap-2"
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
              <span className="text-white font-medium">New Campaign</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div 
                key={campaign._id}
                className="group bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 rounded-xl p-6 border border-zinc-800/50 hover:border-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-zinc-100">{campaign.name}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{campaign.description}</p>
                    {campaign.objective && (
                      <p className="text-sm text-indigo-400 mt-2">
                        <span className="font-medium">Objective:</span> {campaign.objective}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="capitalize">{campaign.testConfig.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <svg
                          className="w-4 h-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                        <span className="text-indigo-400">
                          {campaign.testConfig.companyName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className="text-center py-8">
                <p className="text-zinc-400">No campaigns yet. Create your first campaign to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
              className="relative w-full max-w-md bg-zinc-800 rounded-xl p-6 shadow-xl border border-zinc-700 m-4"
            >
              <h3 className="text-xl font-semibold mb-4">
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

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
} 