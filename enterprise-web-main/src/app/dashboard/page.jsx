/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/
'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '../../components/catalyst/button';
import { UserButton } from '@clerk/nextjs';
import { SignedIn, SignedOut, RedirectToSignIn, OrganizationSwitcher ,CreateOrganization} from '@clerk/nextjs';
import { Dialog, Transition } from '@headlessui/react';
import { faWater, faShieldAlt, faChartLine, faHome, faCog, faEye, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Home, BarChart2, Settings, Droplet, Heart, View, Activity, Users, AlertTriangle } from 'lucide-react'
import { Fragment } from 'react';
import { dark } from '@clerk/themes';
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';
import SecurityChart from './components/SecurityChart';



const DashboardCard = ({ title, value, label, color, icon }) => (
  <div className={`bg-white dark:bg-neutral-800 p-6 shadow  ${color}`}>
    <h3 className="text-lg font-semibold mb-2 text-neutral-500 dark:text-white">{title}</h3>
    <p className={`text-3xl font-bold text-neutral-500 dark:text-white `}>{value}</p>
    <p className="text-sm text-neutral-500 dark:text-white">{label}</p>
    {icon && <FontAwesomeIcon icon={icon} className="mt-4 h-10 w-10 text-neutral-500 dark:text-neutral-400" />}
  </div>
);

const SecurityScoreCard = ({ score, change }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500 dark:text-green-400";
    if (score >= 60) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 shadow">
      <h3 className="text-lg font-semibold mb-2 text-neutral-500 dark:text-white">Security Score</h3>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</p>
        <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      </div>
      <div className="mt-4 h-2 bg-neutral-200 dark:bg-neutral-700 rounded">
        <div 
          className={`h-2 rounded ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const ActivityTimeline = ({ activities }) => (
  <div className="bg-white dark:bg-neutral-800 shadow p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold dark:text-white">Recent Activity</h3>
      <select className="bg-transparent dark:text-white border border-neutral-300 dark:border-neutral-600 rounded px-3 py-1">
        <option value="all">All Activities</option>
        <option value="tests">Phishing Tests</option>
        <option value="training">Training</option>
      </select>
    </div>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-4 items-start">
          <div className={`mt-1 w-2 h-2 rounded-full ${
            activity.type === 'test' ? 'bg-blue-500' :
            activity.type === 'training' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <div>
            <p className="dark:text-white">{activity.description}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// New component for test statistics
const TestStatistics = ({ stats }) => (
  <div className="bg-white dark:bg-neutral-800 p-6 shadow">
    <h3 className="text-lg font-semibold mb-4 dark:text-white">Test Statistics</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Success Rate</p>
        <p className="text-2xl font-bold text-green-500">{stats.successRate}%</p>
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Click Rate</p>
        <p className="text-2xl font-bold text-red-500">{stats.clickRate}%</p>
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Tests</p>
        <p className="text-2xl font-bold dark:text-white">{stats.totalTests}</p>
      </div>
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">At Risk Users</p>
        <p className="text-2xl font-bold text-yellow-500">{stats.atRiskUsers}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useUser();
    const { organization } = useOrganization();
    const { setActive } = useOrganizationList();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [securityMetrics, setSecurityMetrics] = useState({
      score: 65,
      change: -5,
      activeTests: 3,
      enrolledMembers: 42,
      recentActivities: [
        { type: 'test', description: 'New phishing campaign started', time: '2 hours ago' },
        { type: 'training', description: '5 team members completed security training', time: '1 day ago' },
        { type: 'alert', description: 'Unusual login activity detected', time: '2 days ago' },
      ]
    });
    const [testStats, setTestStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testData, setTestData] = useState([]);

    useEffect(() => {
      // Check for user's preference in localStorage first
      const storedDarkMode = localStorage.getItem('darkMode');
      const isDarkMode = storedDarkMode !== null 
        ? storedDarkMode === 'true' 
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDarkMode);
    }, []);
  
    useEffect(() => {
      // Apply dark mode class to body
      document.body.classList.toggle('dark', darkMode);
      // Save preference to localStorage
      //localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);
  
    const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem('darkMode', newDarkMode);
    };
  
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
  
    useEffect(() => {
      const fetchTestData = async () => {
        if (!organization) return;
        
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const url = `${apiUrl}/api/organizations/${organization.id}/tests`;
          console.log('Fetching from:', url);

          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const tests = await response.json();
          console.log('Fetched tests:', tests);
          
          // Store the raw test data for the chart
          setTestData(tests);
          
          // Calculate statistics from test data
          const stats = calculateTestStats(tests);
          setTestStats(stats);
          
          // Update security metrics based on test results
          setSecurityMetrics(prevMetrics => ({
            ...prevMetrics,
            score: calculateSecurityScore(tests),
            activeTests: tests.filter(test => test.state === "Live").length,
            recentActivities: generateRecentActivities(tests),
          }));
        } catch (err) {
          console.error('Error details:', err);
          setError(`Failed to fetch test data: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchTestData();
    }, [organization]);

    // Helper function to calculate click rate (lower is better)
    const calculateClickRate = (tests) => {
      const completedTests = tests.filter(test => test.state === "Completed");
      if (!completedTests.length) return 100; // Perfect score if no tests completed
      
      const clickedTests = completedTests.filter(test => test.clicked);
      const clickRate = (clickedTests.length / completedTests.length) * 100;
      
      // Return inverted score (lower click rate is better)
      return 100 - clickRate;
    };

    // Helper function to calculate completion rate
    const calculateCompletionRate = (tests) => {
      if (!tests.length) return 0;
      
      const completedTests = tests.filter(test => test.state === "Completed");
      return (completedTests.length / tests.length) * 100;
    };

    // Helper function to calculate response time score
    const calculateResponseTime = (tests) => {
      const completedTests = tests.filter(test => test.state === "Completed" && test.completedAt);
      if (!completedTests.length) return 100; // Perfect score if no tests completed
      
      // Calculate average response time in hours
      const avgResponseTime = completedTests.reduce((sum, test) => {
        const startTime = test.createdAt._seconds * 1000;
        const endTime = test.completedAt._seconds * 1000;
        return sum + (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
      }, 0) / completedTests.length;
      
      // Score based on response time (faster is better)
      // Under 1 hour: 100%, 24 hours: 50%, 48 hours or more: 0%
      const score = Math.max(0, 100 - (avgResponseTime / 48) * 100);
      return Math.round(score);
    };

    // Helper function to calculate security score
    const calculateSecurityScore = (tests) => {
      if (!tests.length) return 0;
      
      const weights = {
        clickRate: 0.4,      // 40% weight for click resistance
        completionRate: 0.3, // 30% weight for test completion
        responseTime: 0.3    // 30% weight for response time
      };

      const metrics = {
        clickRate: calculateClickRate(tests),
        completionRate: calculateCompletionRate(tests),
        responseTime: calculateResponseTime(tests)
      };

      return Math.round(
        (metrics.clickRate * weights.clickRate) +
        (metrics.completionRate * weights.completionRate) +
        (metrics.responseTime * weights.responseTime)
      );
    };

    // Helper function to calculate test statistics
    const calculateTestStats = (tests) => {
      const totalTests = tests.length;
      const completedTests = tests.filter(test => test.state === "Completed");
      const clickedTests = completedTests.filter(test => test.clicked);
      
      return {
        totalTests,
        successRate: totalTests ? 
          Math.round((completedTests.length / totalTests) * 100) : 0,
        clickRate: completedTests.length ? 
          Math.round((clickedTests.length / completedTests.length) * 100) : 0,
        atRiskUsers: clickedTests.length
      };
    };

    // Helper function to generate recent activities
    const generateRecentActivities = (tests) => {
      return tests
        .sort((a, b) => b.createdAt._seconds - a.createdAt._seconds)
        .slice(0, 5)
        .map(test => ({
          type: 'test',
          description: `${test.type} test ${test.state.toLowerCase()}`,
          time: formatRelativeTime(test.createdAt._seconds * 1000)
        }));
    };

    // Helper function to format relative time
    const formatRelativeTime = (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) return `${minutes} minutes ago`;
      if (hours < 24) return `${hours} hours ago`;
      return `${days} days ago`;
    };
  
    return (
      <>
        <SignedIn>
          <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode}>
                        {/* Sidebar links are now updated */}
                    </Sidebar>

            <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : ''}`}>
              <Navbar>
                <div className="flex items-center">
                  {!sidebarOpen && (
                    <Button onClick={toggleSidebar} className="mr-4 cursor-pointer text-neutral-800 dark:text-white" color="neutral">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </Button>
                  )}
                  <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                    <div className="w-11 h-6 bg-neutral-200 border-2 border-neutral-300 dark:border-transparent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-red-600"></div>
                    <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-300">
                      {darkMode ? '🌙' : '☀️'}
                    </span>
                  </label>
                  <UserButton appearance={{
                    baseTheme: darkMode ? dark : undefined
                  }}/>
                </div>
              </Navbar>
  
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
                <div className="container mx-auto px-6 py-8">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Activity className="animate-spin h-8 w-8 text-red-500" />
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded">
                      <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  ) : (
                    <>
                      {!organization ? (
                        <div className="bg-white dark:bg-neutral-800 border-t-4 border-red-500 dark:border-red-500  shadow p-6 mb-8">
                          <h2 className="text-2xl  mb-4 dark:text-white">Welcome to Firstwave</h2>
                          <p className="text-neutral-600 dark:text-white mb-6">
                            Get started by creating your organization and inviting members.
                          </p>
                        
                          <Button onClick={openModal} color="red">
                            Create Organization
                          </Button>
                          <Transition appear show={isModalOpen} as={Fragment}>
                            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <div className="fixed inset-0 bg-black bg-opacity-25" />
                              </Transition.Child>

                              <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4 text-center">
                                  <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                  >
                                    <Dialog.Panel className="w-full max-w-lg bg-transparent transform overflow-hidden rounded-2xl  p-6 text-left align-middle transition-all">
                                  
       
                                      <CreateOrganization routing="hash" appearance={{
                                          baseTheme: darkMode ? dark : undefined
                                        }} />

                                
                                    
                                    </Dialog.Panel>
                                  </Transition.Child>
                                </div>
                              </div>
                            </Dialog>
                          </Transition>
                        </div>
                      ) : (
                        <>  
                            <div className='dark:bg-orange-900/50 dark:text-orange-400 flex justify-between items-center border-t-4 dark:border-orange-900 border-red-500 bg-red-100 shadow p-3 mb-8'>
                            <h1>You are in demo mode. Your data will save, but some features may be disabled.</h1>
                            <Button color="white">Contact Sales</Button>
                            </div>

                          <h2 className="text-4xl font-bold mb-4 dark:text-white"> {organization.name}</h2>
                          <p className="text-neutral-600 dark:text-white mb-8">
                            Here's an overview of your organization's cybersecurity status.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <SecurityScoreCard score={securityMetrics.score} change={securityMetrics.change} />
                            <TestStatistics stats={testStats} />
                            <DashboardCard 
                              title="Active Tests" 
                              value={securityMetrics.activeTests} 
                              label="Running Campaigns"
                              icon={<Activity className="h-5 w-5" />}
                              color="text-blue-500 dark:text-blue-400" 
                            />
                          </div>
                          <div className="mb-8">
                            <SecurityChart tests={testData} />
                          </div>
                          <ActivityTimeline activities={securityMetrics.recentActivities} />
                          <div className="mt-8 flex gap-4">
                            <Button color="red" href="/dashboard/new-campaign">
                              Start New Campaign
                            </Button>
                            <Button color="dark" href="/dashboard/reports">
                              View Reports
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </main>
            </div>
          </div>
        </SignedIn>
        <SignedOut>
            <RedirectToSignIn />
        </SignedOut>
      </>
    );
  };
export default Dashboard;