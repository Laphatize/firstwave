"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { Button } from '@/components/catalyst/button';
import { UserButton, SignedIn, SignedOut, RedirectToSignIn, OrganizationSwitcher, CreateOrganization } from '@clerk/nextjs';
import { Dialog, Transition } from '@headlessui/react';
import { dark } from '@clerk/themes';
import Link from 'next/link';
import { faWater, faShieldAlt, faChartLine, faHome, faCog, faEye, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserRound, UsersRound, Building } from 'lucide-react'
import { Home, BarChart2, Settings, Droplet, Heart, View } from 'lucide-react'

const phishingTests = [
    {
        id: 1,
        name: 'Spearphishing',
        description: 'A simple phishing test to assess basic awareness.',
        disabled: false,
    },
    {
        id: 2,
        name: 'Advanced Phishing Test',
        description: 'A more complex phishing test to challenge users.',
        disabled: true,
    },
    {
        id: 3,
        name: 'Spear Phishing Test',
        description: 'A targeted phishing test to simulate spear phishing attacks.',
        disabled: true,
    },
];

const Sidebar = ({ children, isOpen, onClose, darkMode }) => (
    <aside className={`bg-white dark:bg-neutral-800/50 border-r border-neutral-800 text-neutral-800 dark:text-white w-64 min-h-screen fixed left-0 top-0 bottom-0 transition-transform duration-200 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="bg-gradient-to-bl from-red-500 to-red-900  px-4 mb-4">
            <div className="flex justify-between items-center mb-4 mt-4">
                <h1 className="text-lg text-white"><span className="font-semibold">Firstwave</span></h1>
                <button onClick={onClose} className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
        <b className='mt-4 ml-3 text-sm text-neutral-400'>GENERAL </b>
        <SidebarLink href="/dashboard" icon={<Home size={18} />}>Dashboard</SidebarLink>
        <SidebarLink href="/dashboard" icon={<BarChart2 size={18} />}>Analytics</SidebarLink>
        <SidebarLink href="/dashboard" icon={<Settings size={18} />}>Settings</SidebarLink>
        <hr className='mt-4 border-neutral-700/50'></hr>
        <b className='mt-4 ml-3 text-sm text-neutral-400'>PRODUCTS </b>
        <SidebarLink href="/phishing" icon={<View size={18} />}>FirstWave Core</SidebarLink>
        <SidebarLink className='ml-3' href="/phishing" icon={
            <span className="relative flex h-3 w-3 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
        }>Active Tests</SidebarLink>
        <SidebarLink href="/phishing" className='ml-3' icon={<Heart size={18} />}>Organization Health</SidebarLink>

        <div className="mt-auto py-2 w-full bg-white dark:bg-neutral-800 dark:text-white mx-auto text-center">
            <OrganizationSwitcher appearance={{ baseTheme: darkMode ? dark : undefined }} />
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

const PhishingTests = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useUser();
    const { organization } = useOrganization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissions, setPermissions] = useState([true, true, true, true, true, true]);

    useEffect(() => {
        // Check for user's preference in localStorage first
        const storedDarkMode = localStorage.getItem('darkMode');
        const isDarkMode = storedDarkMode !== null 
            ? storedDarkMode === 'true' 
            : window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDarkMode);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark', darkMode);
       // localStorage.setItem('darkMode', darkMode);
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

    const togglePermission = (index) => {
        setPermissions(prev => prev.map((p, i) => i === index ? !p : p));
    };

    return (
        <>
            <SignedIn>
                <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
                    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode}>
                        {/* Sidebar links are now updated */}
                    </Sidebar>

                    <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : ''}`}>
                    <div className='w-full bg-gradient-to-tr from-red-500 to-red-900 hidden'>
                                   <div className='px-4 py-1 text-white text-lg'>
                                   <FontAwesomeIcon icon={faWater} /> <span className='font-semibold'>Firstwave</span> Core
                                   </div>
                            </div>
                        <Navbar>
                            <div className="flex items-center">
                                {!sidebarOpen && (
                                    <Button onClick={toggleSidebar} className="mr-4 cursor-pointer text-neutral-800 dark:text-white" color="neutral">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </Button>
                                )}
                                <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Phishing Tests</h1>
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
                                <UserButton appearance={{ baseTheme: darkMode ? dark : undefined }} />
                            </div>
                          
                        </Navbar>


                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
                            <div className="container mx-auto px-6 py-8">
                                {!organization ? (
                                    <div className="bg-white dark:bg-neutral-800 border-t-4 border-red-500 dark:border-red-500 shadow p-6 mb-8">
                                        <h2 className="text-2xl mb-4 dark:text-white">Welcome to Firstwave</h2>
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
                                                            <Dialog.Panel className="w-full max-w-lg bg-transparent transform overflow-hidden rounded-2xl p-6 text-left align-middle transition-all">
                                                                <CreateOrganization routing="hash" appearance={{ baseTheme: darkMode ? dark : undefined }} />
                                                            </Dialog.Panel>
                                                        </Transition.Child>
                                                    </div>
                                                </div>
                                            </Dialog>
                                        </Transition>
                                    </div>
                                ) : (
                                    <div className=" p-6 mb-8">

                                        <div className='grid grid-cols-3 gap-x-4'>
                                            <div className='col-span-2'>
                                            <a className='text-xs text-sm dark:text-white'> &lt; Go back</a>
                                            <h1 className='dark:text-white text-2xl'>Configuration</h1>
                                            <p className='dark:text-white'>for <span className='font-bold text-red-500'>Spearphishing Testing</span></p>

                                            <h2 className='mt-4 dark:text-white text-lg'>Who would you like to be tested?</h2>
                                            <div className='gap-x-4 grid grid-cols-3 dark:text-white mt-4'>
                                            <div className='border px-2 py-4 w-full text-center mx-auto cursor-pointer hover:bg-neutral-800 duration-100 transition'>
                                                <UserRound className='dark:text-white text-center mx-auto w-2xl' size={35}/>
                                                <h1>Single Employee</h1>
                                                </div>
                                                <div className='border px-2 py-4 w-full text-center mx-auto cursor-pointer hover:bg-neutral-800 duration-100 transition'>
                                                <UsersRound className='dark:text-white text-center mx-auto w-2xl' size={35}/>
                                                <h1>Group of Employees</h1>
                                                </div>
                                                <div className='border px-2 py-4 w-full text-center mx-auto cursor-pointer hover:bg-neutral-800 duration-100 transition'>
                                                <Building className='dark:text-white text-center mx-auto w-2xl' size={35}/>
                                                <h1>Firmwide</h1>
                                                </div>
                                                </div>

                                                <h2 className='mt-6 dark:text-white text-lg'>What is Firstwave permitted to do?</h2>
                                                <div className='mt-4 grid grid-cols-2 gap-x-4 gap-y-4'>
                                                    {[
                                                        'Send phishing emails',
                                                        'Attempt social engineering via phone',
                                                        'Create fake social media profiles',
                                                        'Attempt physical security breaches',
                                                        'Use advanced tactics (e.g., deepfakes)',
                                                        'Communicate with private social media accounts'
                                                    ].map((item, index) => (
                                                        <div key={index} className='flex items-center'>
                                                            <label
                                                                htmlFor={`permission-${index}`}
                                                                className="relative inline-flex items-center cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    id={`permission-${index}`}
                                                                    className="sr-only"
                                                                    checked={permissions[index]}
                                                                    onChange={() => togglePermission(index)}
                                                                />
                                                                <div className={`w-6 h-6 ${permissions[index] ? 'bg-green-600' : 'bg-red-600'} focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 rounded flex items-center justify-center`}>
                                                                    {permissions[index] ? (
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{item}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>


                                            <div>
                                                <div className='border-2 border-neutral-800 dark:bg-neutral-900 px-4 py-4'>
                                                    <h2 className='dark:text-white text-xl'>What is spearfishing?</h2>
                                                    <p className='dark:text-white mt-2'>
                                                    Unlike generic phishing attacks, which are sent to many recipients, spear phishing involves personalized messages that are crafted to appear legitimate and relevant to the target. Attackers often use information gathered from social media or other sources to create convincing emails or messages, increasing the likelihood that the target will fall for the scam.
                                                    </p>
                                                    <p></p>
                                                </div>

                                                <div className='mt-2 border-2 border-neutral-800 dark:bg-neutral-900 px-4 py-4'>
                                                    <h2 className='dark:text-white text-xl'>How does this test work?</h2>
                                                    <p className='dark:text-white mt-2'>
                                                    Firstwave uses AI powered web agents that will attempt to reach out to employees via whatever method permitted in the test configuration.
                                                    </p>
                                                    <p></p>
                                                </div>
                                            </div>
                                       </div>
                                        
                                    </div>
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

export default PhishingTests;
