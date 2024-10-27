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
import { Fragment } from 'react';
import { dark } from '@clerk/themes';
const Sidebar = ({ children, isOpen, onClose, darkMode }) => (
  <aside className={`bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white w-64 min-h-screen fixed left-0 top-0 bottom-0 transition-transform duration-200 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}  flex flex-col`}>
    <div className="bg-red-700 px-4  mb-4">
      <div className="flex justify-between items-center mb-4 mt-4">
        <h1 className="text-lg text-white"><span className="font-semibold">Firstwave</span></h1>
        <button onClick={onClose} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    {children}
    <div className="mt-auto py-2 w-full bg-white dark:bg-neutral-800 dark:text-white mx-auto text-center">
      <OrganizationSwitcher appearance={{
        baseTheme: darkMode ? dark : undefined
      }}/>
    </div>
  </aside>
);

const SidebarLink = ({ className, href, children, icon }) => (
  <Link href={href} className={`block py-2 px-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors duration-200 flex items-center ${className}`}>
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </Link>
);

const Navbar = ({ children }) => (
  <nav className="bg-neutral-200 dark:bg-neutral-800/40 shadow-md p-4 flex justify-between items-center">
    {children}
  </nav>
);

const DashboardCard = ({ title, value, label, color }) => (
  <div className={`bg-white dark:bg-neutral-800 p-6 shadow text-center`}>
    <h3 className="text-lg font-semibold mb-2 text-gray-500 dark:text-white">{title}</h3>
    <p className={`text-3xl font-bold text-gray-500 dark:text-white `}>{value}</p>
    <p className="text-sm text-gray-500 dark:text-white">{label}</p>
  </div>
);



const Dashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useUser();
    const { organization } = useOrganization();
    const { setActive } = useOrganizationList();
    const [isModalOpen, setIsModalOpen] = useState(false);

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
  
   
    return (
      <>
        <SignedIn>
          <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode}>
            <b className='mt-4 ml-3 text-sm text-neutral-400'>GENERAL </b>

              <SidebarLink href="/dashboard" icon={
                <FontAwesomeIcon icon={faHome}  />
              }>Dashboard</SidebarLink> 
                  <SidebarLink href="/dashboard" icon={
                <FontAwesomeIcon icon={faChartLine}  />
          
              }>Analytics</SidebarLink>
                <SidebarLink href="/dashboard" icon={
                <FontAwesomeIcon icon={faCog}  />   
             
              }>Settings</SidebarLink>


                <hr className='mt-4 border-neutral-700'></hr>
                <b className='mt-4 ml-3 text-sm text-neutral-400'>PRODUCTS </b>
              <SidebarLink href="/phishing" icon={
              <FontAwesomeIcon icon={faWater}  />
             
              }>FirstWave</SidebarLink>

<SidebarLink className='ml-3' href="/phishing" icon={
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
  </span>
}>
  Active Tests
</SidebarLink>
<SidebarLink href="/phishing" className='ml-3' icon={
              <FontAwesomeIcon icon={faHeart}  />
             
              }>Organizaton Health</SidebarLink>

          

<SidebarLink href="/phishing" icon={
                <FontAwesomeIcon icon={faShieldAlt}  />
          
              }>Guardian</SidebarLink>
              <SidebarLink href="/phishing" icon={
                <FontAwesomeIcon icon={faEye}  />
          
              }>Sentry</SidebarLink>
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
                    <div className="w-11 h-6 bg-gray-200 border-2 border-neutral-300 dark:border-transparent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
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
                  {!organization ? (
                    <div className="bg-white dark:bg-neutral-800 border-t-4 border-red-500 dark:border-red-500  shadow p-6 mb-8">
                      <h2 className="text-2xl  mb-4 dark:text-white">Welcome to Firstwave</h2>
                      <p className="text-gray-600 dark:text-white mb-6">
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
                      <p className="text-gray-600 dark:text-white mb-8">
                        Here's an overview of your organization's cybersecurity status.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <DashboardCard title="Phishing Tests" value="3" label="Active Campaigns" color="text-black dark:text-white" />
                        <DashboardCard title="Team Members" value="42" label="Enrolled" color="text-black dark:text-white" />
                        <DashboardCard title="Security Score" value="C-" label="Last 30 Days" color="text-red-500 dark:text-red-800" />
                      </div>
                      <div className="bg-white dark:bg-neutral-800  shadow p-6 mb-8">
                        <h3 className="text-xl font-semibold mb-4 dark:text-white">Recent Activity</h3>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>New phishing campaign started - 2 days ago</li>
                          <li>5 team members completed training - Yesterday</li>
                          <li>Security score improved by 5% - This week</li>
                        </ul>
                      </div>
                      <Button color="red" href="/dashboard/new-campaign">
                        Start New Campaign
                      </Button>
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