'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigation = [
  { name: 'Campaigns', href: '/dashboard', icon: FolderIcon },
  { name: 'Tests', href: '/tests', icon: ServerIcon },
  { name: 'Activity', href: '/activity', icon: SignalIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarSquareIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const organizations = [
  { id: 1, name: 'Security Team', href: '#', initial: 'S', current: false },
  { id: 2, name: 'Development', href: '#', initial: 'D', current: false },
  { id: 3, name: 'Operations', href: '#', initial: 'O', current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ user, sidebarOpen, setSidebarOpen, handleLogout }) {
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <div className="relative z-50 xl:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/80"
            />

            <div className="fixed inset-0 flex">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="relative mr-16 flex w-full max-w-xs flex-1"
              >
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>

                {/* Sidebar component for mobile */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-neutral-900 px-6 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      src="https://www.vyvern.com/trans_logo.png"
                      alt="Vyvern"
                      className="h-8 w-auto"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={classNames(
                                  pathname === item.href
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                                )}
                              >
                                <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <div className="text-xs font-semibold leading-6 text-neutral-400">Your organizations</div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {organizations.map((org) => (
                            <li key={org.name}>
                              <Link
                                href={org.href}
                                className={classNames(
                                  org.current
                                    ? 'bg-neutral-800 text-white'
                                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
                                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                                )}
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-[0.625rem] font-medium text-neutral-400 group-hover:text-white">
                                  {org.initial}
                                </span>
                                <span className="truncate">{org.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="-mx-6 mt-auto">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-neutral-800"
                        >
                          <img
                            className="h-8 w-8 rounded-full bg-neutral-800"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || '')}&background=ef4444&color=fff`}
                            alt=""
                          />
                          <span className="sr-only">Your profile</span>
                          <span aria-hidden="true">{user?.email}</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-neutral-950/50 px-6 ring-1 ring-white/5">
          <div className="flex h-16 shrink-0 items-center">
            <img
              src="https://www.vyvern.com/trans_logo.png"
              alt="Vyvern"
              className="h-8 w-auto"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={classNames(
                          pathname === item.href
                            ? 'bg-neutral-800 text-white'
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-neutral-400">Your organizations</div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {organizations.map((org) => (
                    <li key={org.name}>
                      <Link
                        href={org.href}
                        className={classNames(
                          org.current
                            ? 'bg-neutral-800 text-white'
                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                        )}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-[0.625rem] font-medium text-neutral-400 group-hover:text-white">
                          {org.initial}
                        </span>
                        <span className="truncate">{org.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-neutral-800"
                >
                  <img
                    className="h-8 w-8 rounded-full bg-neutral-800"
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || '')}&background=ef4444&color=fff`}
                    alt=""
                  />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user?.email}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
} 