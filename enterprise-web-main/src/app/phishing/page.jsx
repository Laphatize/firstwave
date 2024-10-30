"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { Button } from '../../components/catalyst/button';
import { UserButton, SignedIn, SignedOut, RedirectToSignIn, OrganizationSwitcher, CreateOrganization } from '@clerk/nextjs';
import { Dialog, Transition } from '@headlessui/react';
import { dark } from '@clerk/themes';
import Link from 'next/link';
import { faWater, faShieldAlt, faChartLine, faHome, faCog, faEye, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Home, BarChart2, Settings, Droplet, Heart, View } from 'lucide-react'
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';

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



const PhishingTests = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useUser();
    const { organization } = useOrganization();
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
                                   <FontAwesomeIcon icon={faWater} /> <span className='font-semibold'>Firstwave</span> FirstWave
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

                                        <div className='flex border-2 bg-neutral-200 align-middle justify-center items-center dark:bg-neutral-800 border-neutral-300 dark:border-transparent text-neutral-800 dark:text-white'>
                                            <h1 className='text-4xl font-semibold mx-auto px-10'>
                                                Run automated phishing tests on your <span className='text-red-500'>own</span> workforce.
                                            </h1>
                                            <img src='../../colorLogoCloud.png' alt='phishing' className='w-1/4 px-10 py-4 object-cover' />
                                            </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                            {phishingTests.map(test => (
                                                <div key={test.id} className={`relative dark:bg-neutral-800 dark:text-white bg-neutral-200 border-2 border-neutral-300 dark:border-transparent text-neutral-800 p-6`}>
                                                    {test.disabled && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 ">
                                                            <p className="text-white font-semibold">This test is disabled for your organization.</p>
                                            
                                                        </div>
                                                    )}
                                                    <h3 className="text-2xl font-semibold mb-4">{test.name}</h3>
                                                    <p className="mb-4">{test.description}</p>
                                                    {!test.disabled && (
                                                        <div className='flex justify-between gap-2'>
                                                        <Button color="white" className="w-full justify-center" href="/phishing/create">Start Test</Button>
                                                        <Button color="white" outline className="w-full justify-center">Details</Button>
                                                        <Button color="white" outline className="w-full justify-center"><FontAwesomeIcon icon={faCog} /></Button>

                                                        </div>
                                                    )}
                                                </div>
                                            ))}
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