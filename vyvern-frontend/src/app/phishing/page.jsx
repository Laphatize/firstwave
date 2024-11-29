"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { Activity, Shield, Target, Users, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/catalyst/button';
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

const PhishingMetricCard = ({ title, value, description, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{description}</p>
      </div>
      <Icon className="h-6 w-6 text-red-500" />
    </div>
    {trend && (
      <div className={`mt-4 text-sm ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
        {trend.positive ? '↑' : '↓'} {trend.value}% from last month
      </div>
    )}
  </div>
);

const CampaignCard = ({ campaign }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold dark:text-white">{campaign.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{campaign.description}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        campaign.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
        campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
        'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400'
      }`}>
        {campaign.status}
      </span>
    </div>
    <div className="mt-4 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-neutral-500" />
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{campaign.targets} targets</span>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-neutral-500" />
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{campaign.sent} sent</span>
      </div>
    </div>
    <div className="mt-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
      <div 
        className="bg-red-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${campaign.progress}%` }}
      />
    </div>
  </div>
);

const PhishingPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { organization } = useOrganization();

  // Example data - replace with real data
  const metrics = [
    {
      title: "Click Rate",
      value: "24%",
      description: "Average phishing success rate",
      icon: Target,
      trend: { positive: false, value: 12 }
    },
    {
      title: "Response Time",
      value: "1.4h",
      description: "Average time to report",
      icon: Activity,
      trend: { positive: true, value: 8 }
    },
    {
      title: "Security Score",
      value: "76/100",
      description: "Based on last 30 days",
      icon: Shield,
      trend: { positive: true, value: 5 }
    }
  ];

  const campaigns = [
    {
      name: "Q1 Awareness Campaign",
      description: "Testing employee response to urgent wire transfers",
      status: "Active",
      targets: 150,
      sent: 89,
      progress: 60
    },
    {
      name: "Security Training Follow-up",
      description: "Password reset campaign",
      status: "Draft",
      targets: 200,
      sent: 0,
      progress: 0
    }
  ];

  return (
    <>
    <SignedIn>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />
        
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
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Phishing Campaigns</h1>
            </div>
          </Navbar>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
            <div className="container mx-auto px-6 py-8">
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 p-8 mb-8">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white leading-tight">
                      Run automated phishing tests on your{' '}
                      <span className="relative">
                        <span className="relative z-10 text-red-500">own</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-red-500/10 -rotate-2"></span>
                      </span>{' '}
                      workforce.
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                      Protect your organization with advanced security awareness training
                    </p>
                    <Button color="red" href="/phishing/create" className="mt-4">
                      Start New Campaign
                    </Button>
                  </div>
                  <div className="relative w-full md:w-1/3">
                    <Image 
                      src="/colorLogoCloud.png"
                      alt="Phishing Security"
                      width={400}
                      height={300}
                      className="object-contain animate-float"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {metrics.map((metric, index) => (
                  <PhishingMetricCard key={index} {...metric} />
                ))}
              </div>

              {/* Active Campaigns */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold dark:text-white">Active Campaigns</h2>
                  <Button color="red">New Campaign</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {campaigns.map((campaign, index) => (
                    <CampaignCard key={index} campaign={campaign} />
                  ))}
                </div>
              </div>
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

export default PhishingPage;