import React from 'react';
import Link from 'next/link';
import { OrganizationSwitcher } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Home, BarChart2, Settings, View, Heart } from 'lucide-react';

const SidebarLink = ({ className, href, children, icon }) => (
    <Link href={href} className={`block py-2 px-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors duration-200 flex items-center ${className}`}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
    </Link>
);

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
        <SidebarLink className='ml-3' href="/phishing/tests/active" icon={
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

export default Sidebar; 