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
import FormModal from '@/components/core/FormModal'; // You'll need to create this component
import { Lock } from 'lucide-react';

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
    const [darkMode, setDarkMode] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useUser();
    const { organization } = useOrganization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permissions, setPermissions] = useState([true, true, true, true, false]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [employees, setEmployees] = useState([{ name: '', email: '' }]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [estimatedDuration, setEstimatedDuration] = useState({ min: 24, max: 48 });
    const [projectedCost, setProjectedCost] = useState(1200);
    
    const placeholders = [
        "Example: Please avoid testing our C-suite executives...",
        "Example: Our employees use Microsoft 365, so that would be a realistic attack vector...",
        "Example: We recently had a security incident, so please be extra cautious...",
        "Example: Our company just went through a merger, this could be good context...",
        "Example: Please focus on testing our finance department specifically..."
    ];

    useEffect(() => {
        let currentText = '';
        let currentIndex = 0;
        let isDeleting = false;
        
        const typewriter = setInterval(() => {
            const currentPlaceholder = placeholders[placeholderIndex];
            
            if (!isDeleting && currentIndex <= currentPlaceholder.length) {
                currentText = currentPlaceholder.slice(0, currentIndex);
                currentIndex++;
            } else if (isDeleting && currentIndex >= 0) {
                currentText = currentPlaceholder.slice(0, currentIndex);
                currentIndex--;
            }

            setDisplayedPlaceholder(currentText);

            if (currentIndex > currentPlaceholder.length) {
                // Start deleting after a pause
                setTimeout(() => {
                    isDeleting = true;
                }, 1500);
            }

            if (isDeleting && currentIndex === 0) {
                isDeleting = false;
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
                currentIndex = 0;
            }

        }, 50); // Adjust speed here (lower = faster)

        return () => clearInterval(typewriter);
    }, [placeholderIndex]);

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
        const newPermissions = permissions.map((p, i) => i === index ? !p : p);
        setPermissions(newPermissions);
        calculateEstimates(selectedOption, newPermissions);
    };

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        calculateEstimates(option, permissions);
        setIsModalOpen(true);
    };

    const getModalContent = () => {
        switch(selectedOption) {
            case 'single':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                Employee Name
                            </label>
                            <input 
                                type="text" 
                                className="px-2 py-1 mt-1 block w-full rounded-md dark:border-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                Employee Email
                            </label>
                            <input 
                                type="email" 
                                className="px-2 py-1 mt-1 block w-full rounded-md dark:border-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                placeholder="john.doe@company.com"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <p 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-white cursor-pointer"
                            >
                                Cancel
                            </p>
                            <button 
                                className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700"
                            >
                                Create Campaign
                            </button>
                        </div>
                    </div>
                );
            case 'group':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                {employees.length} employee{employees.length !== 1 ? 's' : ''} added
                            </span>
                            {employees.length > 1 && (
                                <button 
                                    onClick={() => setEmployees([{ name: '', email: '' }])}
                                    className="text-sm text-red-500 hover:text-red-600"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div id="employee-list" className="space-y-4 max-h-[400px] overflow-y-auto pr-2
                            scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600 
                            scrollbar-track-neutral-200 dark:scrollbar-track-neutral-800 
                            hover:scrollbar-thumb-neutral-500 dark:hover:scrollbar-thumb-neutral-500">
                            {employees.map((emp, index) => (
                                <div key={index} className="flex space-x-2">
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={emp.name}
                                            onChange={(e) => handleEmployeeChange(index, 'name', e.target.value)}
                                            className="px-2 py-1 w-full rounded-md dark:border-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                            placeholder="Employee Name"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="email" 
                                            value={emp.email}
                                            onChange={(e) => handleEmployeeChange(index, 'email', e.target.value)}
                                            className="px-2 py-1 w-full rounded-md dark:border-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                            placeholder="Email"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeEmployee(index)}
                                        className=" text-lg text-red-500  rounded "
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={addEmployee}
                            className="w-full px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-white rounded hover:bg-neutral-300 dark:hover:bg-neutral-600"
                        >
                            + Add Another Employee
                        </button>
                        <div className="flex justify-end space-x-2 pt-4">
                        <p 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-white cursor-pointer"
                            >
                                Cancel
                            </p>
                            <button 
                                className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700"
                            >
                                Create Campaign
                            </button>
                        </div>
                    </div>
                );
            case 'firmwide':
                return (
                    <div className="space-y-4">
                        {!selectedFile ? (
                            <div 
                                className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-8 text-center"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onDrop={handleFileDrop}
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label 
                                    htmlFor="csv-upload"
                                    className="cursor-pointer text-neutral-600 dark:text-neutral-300"
                                >
                                    <div className="text-4xl mb-2">📄</div>
                                    <p>Drag and drop your CSV file here or click to browse</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                        CSV should include columns: Name, Email
                                    </p>
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {employees.length} employee{employees.length !== 1 ? 's' : ''} loaded
                                    </span>
                                    <button 
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setEmployees([{ name: '', email: '' }]);
                                        }}
                                        className="text-sm text-red-500 hover:text-red-600"
                                    >
                                        Clear File
                                    </button>
                                </div>
                                <div id="employee-list" className="space-y-4 max-h-[400px] overflow-y-auto pr-2
                                    scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-600 
                                    scrollbar-track-neutral-200 dark:scrollbar-track-neutral-800 
                                    hover:scrollbar-thumb-neutral-500 dark:hover:scrollbar-thumb-neutral-500">
                                    {employees.map((emp, index) => (
                                        <div key={index} className="flex space-x-2">
                                            <div className="flex-1">
                                                <input 
                                                    type="text" 
                                                    value={emp.name}
                                                    readOnly
                                                    className="px-2 py-1 w-full rounded-md dark:border-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input 
                                                    type="email" 
                                                    value={emp.email}
                                                    readOnly
                                                    className="px-2 py-1 w-full rounded-md dark:border-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                            <p 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-white cursor-pointer"
                            >
                                Cancel
                            </p>
                            <button 
                                className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-700"
                            >
                                Create Campaign
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch(selectedOption) {
            case 'single': return 'Configure Single Employee Campaign';
            case 'group': return 'Configure Group Campaign';
            case 'firmwide': return 'Configure Firmwide Campaign';
            default: return '';
        }
    };

    const handleEmployeeChange = (index, field, value) => {
        const newEmployees = [...employees];
        newEmployees[index][field] = value;
        setEmployees(newEmployees);
    };

    const addEmployee = () => {
        setEmployees([...employees, { name: '', email: '' }]);
    };

    const removeEmployee = (index) => {
        const newEmployees = employees.filter((_, i) => i !== index);
        setEmployees(newEmployees);
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
            const csvData = await readCSVFile(file);
            setEmployees(csvData);
        }
    };

    const handleFileDrop = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
            const csvData = await readCSVFile(file);
            setEmployees(csvData);
        }
    };

    const readCSVFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',');
                const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
                const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
                
                const employees = lines.slice(1)
                    .filter(line => line.trim())
                    .map(line => {
                        const values = line.split(',');
                        return {
                            name: values[nameIndex]?.trim() || '',
                            email: values[emailIndex]?.trim() || ''
                        };
                    });
                resolve(employees);
            };
            reader.readAsText(file);
        });
    };

    // Add this useEffect to handle auto-scrolling
    useEffect(() => {
        const employeeList = document.getElementById('employee-list');
        if (employeeList) {
            employeeList.scrollTop = employeeList.scrollHeight;
        }
    }, [employees]);

    const calculateEstimates = (option, permissionsEnabled) => {
        let baseCost = 0;
        let baseDuration = { min: 24, max: 48 };

        // Base costs by campaign type
        switch(option) {
            case 'single':
                baseCost = 750;  // Single employee baseline
                baseDuration = { min: 12, max: 24 };
                break;
            case 'group':
                baseCost = 1500; // Small group baseline (up to 10 employees)
                baseDuration = { min: 24, max: 48 };
                // Add $100 per employee beyond 10
                if (employees.length > 10) {
                    baseCost += (employees.length - 10) * 100;
                }
                break;
            case 'firmwide':
                baseCost = 3000; // Firmwide baseline (up to 50 employees)
                baseDuration = { min: 48, max: 72 };
                // Add $75 per employee beyond 50
                if (employees.length > 50) {
                    baseCost += (employees.length - 50) * 75;
                }
                break;
        }

        // Additional costs based on enabled permissions
        const permissionCosts = {
            0: 250,  // Send phishing emails (basic)
            1: 500,  // Attempt social engineering via phone
            2: 350,  // Create fake social media profiles
            3: 750,  // Use advanced tactics
            4: 400   // Communicate with private social media accounts
        };

        // Add costs for enabled permissions
        permissionsEnabled.forEach((enabled, index) => {
            if (enabled) {
                baseCost += permissionCosts[index];
                
                // Increase duration for complex permissions
                if (index === 1 || index === 3) { // Phone or advanced tactics
                    baseDuration.min += 12;
                    baseDuration.max += 24;
                }
            }
        });

        // Volume discounts
        if (baseCost > 5000) {
            baseCost = baseCost * 0.9; // 10% discount for large campaigns
        }
        if (baseCost > 10000) {
            baseCost = baseCost * 0.85; // Additional 15% discount for very large campaigns
        }

        // Round to nearest hundred
        baseCost = Math.ceil(baseCost / 100) * 100;

        // Update state
        setEstimatedDuration(baseDuration);
        setProjectedCost(baseCost);
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
                                    <div className="w-11 h-6 bg-neutral-200 border-2 border-neutral-300 dark:border-transparent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-red-600"></div>
                                    <span className="ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-300">
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
                                            <a className='text-xs text-sm dark:text-white dark:hover:text-red-500' href='/phishing'> &lt; Go back</a>
                                            <h1 className='dark:text-white text-2xl'>Configuration</h1>
                                            <p className='dark:text-white'>for <span className='font-bold text-red-500'>Spearphishing Testing</span></p>

                                            <h2 className='mt-4 dark:text-white text-lg'>Who would you like to be tested?</h2>
                                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                                <div 
                                                    onClick={() => handleOptionClick('single')}
                                                    className={`border px-2 py-4 w-full text-center mx-auto cursor-pointer 
                                                        hover:bg-neutral-800 duration-100 transition
                                                        ${selectedOption === 'single' ? 'border-red-500 border-2 animate-border-pulse' : ''}`}
                                                >
                                                    <UserRound className='dark:text-white text-center mx-auto w-2xl' size={35}/>
                                                    <h1 className='dark:text-white'>Single Employee</h1>
                                                </div>
                                                
                                                <div 
                                                    onClick={() => handleOptionClick('group')}
                                                    className={`border px-2 py-4 w-full text-center mx-auto cursor-pointer 
                                                        hover:bg-neutral-800 duration-100 transition
                                                        ${selectedOption === 'group' ? 'border-red-500 border-2 animate-border-pulse' : ''}`}
                                                >
                                                    <UsersRound className='dark:text-white text-center mx-auto w-2xl' size={35}/>
                                                    <h1 className='dark:text-white'>Group of Employees</h1>
                                                </div>

                                                <div 
                                                    onClick={() => handleOptionClick('firmwide')}
                                                    className={`border px-2 py-4 w-full text-center mx-auto cursor-pointer 
                                                        hover:bg-neutral-800 duration-100 transition
                                                        ${selectedOption === 'firmwide' ? 'border-red-500 border-2 animate-border-pulse' : ''}`}
                                                >
                                                    <Building className='dark:text-white text-center mx-auto w-2xl' size={35}/>
                                                    <h1 className='dark:text-white'>Firmwide</h1>
                                                </div>
                                            </div>

                                                <h2 className='mt-6 dark:text-white text-lg'>What is Firstwave permitted to do?</h2>
                                                <div className='mt-4 grid grid-cols-2 gap-x-4 gap-y-4'>
                                                    {[
                                                        { text: 'Send phishing emails', disabled: false },
                                                        { text: 'Attempt social engineering via phone', disabled: true },
                                                        { text: 'Create fake social media profiles', disabled: false },
                                                        { text: 'Use advanced tactics (e.g., deepfakes)', disabled: true },
                                                        { text: 'Communicate with private social media accounts', disabled: false }
                                                    ].map((item, index) => (
                                                        <div key={index} className='flex items-center'>
                                                            <label
                                                                htmlFor={`permission-${index}`}
                                                                className={`relative inline-flex items-center ${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    id={`permission-${index}`}
                                                                    className="sr-only"
                                                                    checked={permissions[index]}
                                                                    onChange={() => !item.disabled && togglePermission(index)}
                                                                    disabled={item.disabled}
                                                                />
                                                                <div className={`w-6 h-6 ${
                                                                    item.disabled ? 'bg-neutral-500' : 
                                                                    permissions[index] ? 'bg-green-600' : 'bg-red-600'
                                                                } focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 rounded flex items-center justify-center`}>
                                                                    {item.disabled ? (
                                                                        <Lock className="w-3 h-3 text-white" />
                                                                    ) : permissions[index] ? (
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span className={`ml-3 text-sm font-medium text-neutral-900 dark:text-neutral-300 ${
                                                                    item.disabled ? 'opacity-50' : ''
                                                                }`}>{item.text}</span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>

                                                <h2 className='mt-6 dark:text-white text-lg'>Any other instructions or information for Firstwave?</h2>
                                                <p className='dark:text-neutral-400  text-sm '>Please don't give Firstwave too much information here, instead use it as a way to be more specific about things you don't want it to do.</p>
                                                <textarea 
                                                    className='w-full h-24 border-2 border-neutral-800 dark:bg-neutral-900 dark:text-white mt-2 px-2'
                                                    placeholder={displayedPlaceholder}
                                                />

                                                <div className='grid grid-cols-2'>
                                                    <div>
                                                        <h2 className='mt-6 dark:text-white text-lg'>Estimated Test Duration</h2>
                                                        <p className='dark:text-white text-xl font-bold'>
                                                            {selectedOption ? 
                                                                `${estimatedDuration.min}-${estimatedDuration.max} hours` : 
                                                                'Select options above'
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h2 className='mt-6 dark:text-white text-lg'>Projected Cost</h2>
                                                        <p className='dark:text-white text-xl font-bold'>${projectedCost}</p>
                                                    </div>
                                                </div>

                                                <div className='flex justify-end mt-4'>
                                                    <Button color='red'>Begin Campaign</Button>
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
            {isModalOpen && (
                <FormModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={getModalTitle()}
                >
                    {getModalContent()}
                </FormModal>
            )}
        </>
    );
};

export default PhishingTests;
