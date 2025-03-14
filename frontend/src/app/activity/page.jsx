'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import Navbar from '@/components/Navbar';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Activity() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserAndActivity = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);

          // Fetch activities (endpoint to be implemented)
          const activitiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (activitiesRes.ok) {
            const activitiesData = await activitiesRes.json();
            setActivities(activitiesData);
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

    fetchUserAndActivity();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };


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
                    placeholder="Search activity..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
          </div>

          <main>
            <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="text-base font-semibold leading-7 text-white">Activity</h1>
              <div className="flex gap-2">
                <select
                  className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
                  defaultValue="all"
                >
                  <option value="all">All Activity</option>
                  <option value="campaigns">Campaigns</option>
                  <option value="tests">Tests</option>
                  <option value="organizations">Organizations</option>
                </select>
              </div>
            </header>

            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mt-6 flow-root">
                <ul role="list" className="-my-5 divide-y divide-white/5">
                  {activities.length === 0 ? (
                    <li className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-full text-center py-8">
                          <p className="text-sm text-neutral-400">No activity to show</p>
                        </div>
                      </div>
                    </li>
                  ) : (
                    activities.map((activity) => (
                      <li key={activity.id} className="py-5">
                        <div className="flex items-center gap-4">
                          <div className={`h-2 w-2 rounded-full ${
                            activity.type === 'campaign' ? 'bg-red-500' :
                            activity.type === 'test' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                            <p className="text-sm text-neutral-400 truncate">{activity.description}</p>
                          </div>
                          <time className="flex-shrink-0 text-sm text-neutral-500">{activity.timestamp}</time>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 