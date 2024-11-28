import React, { useEffect } from 'react';
import Link from 'next/link';
import { OrganizationSwitcher, useOrganization } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Home, BarChart2, Settings, View, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SidebarLink = ({ className, href, children, icon }) => (
    <Link href={href} className={`block py-2.5 px-4 hover:bg-neutral-800/50 dark:hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center gap-3 ${className}`}>
        {icon && <span className="text-neutral-400">{icon}</span>}
        <span className="text-sm font-medium">{children}</span>
    </Link>
);

const Sidebar = ({ children, isOpen, onClose, darkMode }) => {
    const { organization } = useOrganization();
    const router = useRouter();

    useEffect(() => {
        const checkSetup = async () => {
            if (!organization?.id) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization.id}`);
                const data = await response.json();

                if (!data.setupCompleted) {
                    router.push('/setup');
                }
            } catch (error) {
                console.error('Error checking setup status:', error);
            }
        };

        checkSetup();
    }, [organization?.id, router]);

    return (
        <aside className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-200 dark:border-neutral-800/50 text-neutral-800 dark:text-white w-64 min-h-screen fixed left-0 top-0 bottom-0 transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
            <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 px-6 py-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl text-white font-medium">vyvern</h1>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 px-3 py-4 space-y-6">
                <div className="space-y-1">
                    <b className='text-xs font-medium text-neutral-400 px-3'>GENERAL</b>
                    <SidebarLink href="/dashboard" icon={<Home size={16} />}>Dashboard</SidebarLink>
                    <SidebarLink href="/dashboard" icon={<BarChart2 size={16} />}>Analytics</SidebarLink>
                    <SidebarLink href="/dashboard" icon={<Settings size={16} />}>Settings</SidebarLink>
                </div>

                <div className="space-y-1 ">
                    <b className='text-xs font-medium text-neutral-400 px-3'>PRODUCTS</b>
                    <SidebarLink href="/phishing" icon={<View size={16} />}>vyvern Core</SidebarLink>
                    <SidebarLink href="/phishing/tests/active" icon={
                        <span className="relative flex h-2 w-2 ml-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    }>Active Tests</SidebarLink>
                    <SidebarLink href="/phishing" icon={<Heart size={16} />}>Organization Health</SidebarLink>
                </div>
            </div>

            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800/50">
                <OrganizationSwitcher 
                    appearance={{ 
                        baseTheme: darkMode ? dark : undefined,
                        elements: {
                            rootBox: "w-full",
                            organizationSwitcherTrigger: "w-full"
                        }
                    }} 
                />
            </div>
        </aside>
    );
};

export default Sidebar; 