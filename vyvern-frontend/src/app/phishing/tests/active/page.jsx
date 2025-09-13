'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { SignedIn } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/catalyst/button';
import { dark } from '@clerk/themes';
import Sidebar from '@/components/core/Sidebar';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Search, Filter, AlertCircle, SortAsc, SortDesc, Calendar, Users, Tag, Download } from 'lucide-react';

const TEST_TYPES = {
  'SPEAR_PHISHING': 'Spear Phishing',
  'MASS_PHISHING': 'Mass Phishing',
  'TARGETED_PHISHING': 'Targeted Phishing',
  'AWARENESS_CAMPAIGN': 'Awareness Campaign'
};

const SORT_OPTIONS = {
  'created-desc': { label: 'Newest First', field: 'createdAt' },
  'created-asc': { label: 'Oldest First', field: 'createdAt' },
  'scope-asc': { label: 'Scope (A-Z)', field: 'scope' },
  'scope-desc': { label: 'Scope (Z-A)', field: 'scope' },
  'type-asc': { label: 'Type (A-Z)', field: 'type' },
  'type-desc': { label: 'Type (Z-A)', field: 'type' }
};

const STATUS_CONFIG = {
  'Pending Approval': { bg: 'bg-yellow-900', text: 'text-yellow-500' },
  'Queued': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  'Starting Soon': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
  'IN_PROGRESS': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  'Live': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
  'FAILED': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
  'COMPLETED': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Pending Approval'];

  // Helper function to get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'Live':
        return (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'FAILED':
        return (
          <svg 
            className="h-3 w-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'COMPLETED':
        return (
          <svg 
            className="h-3 w-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm
        font-medium transition-all duration-200
        ${config.bg} ${config.text}
        hover:scale-105 hover:shadow-lg hover:shadow-${config.text}/10
        backdrop-blur-sm
      `}
    >
      {getStatusIcon()}
      <span className="relative">
        {status}
        {(status === 'Live' || status === 'IN_PROGRESS') && (
          <span 
            className={`
              absolute -right-1 -top-1 h-2 w-2 rounded-full
              ${status === 'Live' ? 'bg-green-500' : 'bg-purple-500'}
              animate-pulse
            `}
          />
        )}
      </span>
    </span>
  );
};

const SearchBar = ({ value, onChange, resultsCount }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`
      relative flex items-center w-full transition-all duration-200
      ${isFocused ? 'ring-2 ring-red-500/20' : ''}
    `}>
      {/* Search Icon */}
      <Search className={`
        absolute left-3 h-4 w-4 transition-colors duration-200
        ${isFocused ? 'text-red-500' : 'text-neutral-400'}
        ${value ? 'text-neutral-500' : ''}
      `} />

      {/* Input Field */}
      <input
        type="text"
        placeholder="Search by test type, ID, or scope..."
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-800/50 
          backdrop-blur-sm border border-neutral-200/10 rounded-xl
          focus:outline-none dark:text-white transition-all duration-200
          placeholder:text-neutral-400 dark:placeholder:text-neutral-500
        `}
      />

      {/* Clear Button - Only show when there's text */}
      {value && (
        <button
          onClick={() => onChange({ target: { value: '' } })}
          className={`
            absolute right-3 p-1 rounded-full
            text-neutral-400 hover:text-neutral-600
            dark:text-neutral-500 dark:hover:text-neutral-300
            transition-colors duration-200
          `}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Search Results Count - Only show when there's text */}
      {value && (
        <div className="absolute -bottom-6 left-0 text-xs text-neutral-500">
          Found {resultsCount} results
        </div>
      )}
    </div>
  );
};

const FilterPanel = ({ 
  filters, 
  setFilters, 
  isOpen, 
  onClose,
  dateRange,
  setDateRange,
  selectedTypes,
  setSelectedTypes
}) => (
  <div className={`
    fixed right-0 top-0 h-screen w-80 bg-white dark:bg-neutral-800/95 
    backdrop-blur-lg shadow-xl transform transition-transform duration-300
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `}>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-white">
          ✕
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium dark:text-white mb-2">Date Range</h4>
        <div className="space-y-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full p-2 rounded-md dark:bg-neutral-700 dark:text-white border border-neutral-200 dark:border-neutral-600"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-full p-2 rounded-md dark:bg-neutral-700 dark:text-white border border-neutral-200 dark:border-neutral-600"
          />
        </div>
      </div>

      {/* Test Type Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium dark:text-white mb-2">Test Types</h4>
        <div className="space-y-2">
          {Object.entries(TEST_TYPES).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedTypes.includes(key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTypes(prev => [...prev, key]);
                  } else {
                    setSelectedTypes(prev => prev.filter(type => type !== key));
                  }
                }}
                className="rounded dark:bg-neutral-700"
              />
              <span className="text-sm dark:text-white">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium dark:text-white mb-2">Status</h4>
        <div className="space-y-2">
          {Object.keys(STATUS_CONFIG).map(status => (
            <label key={status} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.status.includes(status)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters(prev => ({
                      ...prev,
                      status: [...prev.status, status]
                    }));
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      status: prev.status.filter(s => s !== status)
                    }));
                  }
                }}
                className="rounded dark:bg-neutral-700"
              />
              <span className="text-sm dark:text-white">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => {
          setFilters({ status: [], types: [] });
          setDateRange({ start: '', end: '' });
          setSelectedTypes([]);
        }}
        className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  </div>
);

const TestCard = ({ test, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white dark:bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-200/10 
              hover:border-red-500/50 transition-all duration-200 cursor-pointer relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0 
                    group-hover:from-red-500/5 group-hover:via-red-500/10 group-hover:to-red-500/5 
                    transition-all duration-500"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold dark:text-white capitalize mb-1">
            {test.type.replace(/-/g, ' ')}
          </h3>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            ID: {test.id}
          </span>
        </div>
        <StatusBadge status={test.state} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Scope</p>
          <p className="text-neutral-800 dark:text-neutral-200 capitalize">{test.scope}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Created</p>
          <p className="text-neutral-800 dark:text-neutral-200">
            {new Date(test.createdAt._seconds * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Permissions</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(test.permissions).map(([key, value]) => (
            <span key={key} className={`px-2 py-1 rounded-md text-xs
              ${value 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
              {key.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Add new statistics section */}
      <div className="mt-6 pt-6 border-t border-neutral-200/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold dark:text-white">{test.stats?.targetCount || 0}</p>
            <p className="text-xs text-neutral-500">Targets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold dark:text-white">{test.stats?.clickRate || '0%'}</p>
            <p className="text-xs text-neutral-500">Click Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold dark:text-white">{test.stats?.reportRate || '0%'}</p>
            <p className="text-xs text-neutral-500">Report Rate</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ActiveTests = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();

  // Add state for tests
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortOption, setSortOption] = useState('created-desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [filters, setFilters] = useState({ status: [], types: [] });
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  // Filtered and searched tests
  const filteredAndSortedTests = React.useMemo(() => {
    return tests
      .filter(test => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          test.type.toLowerCase().includes(searchLower) ||
          test.id.toLowerCase().includes(searchLower) ||
          test.scope.toLowerCase().includes(searchLower);
        
        const matchesStatus = filters.status.length === 0 || filters.status.includes(test.state);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(test.type);
        const matchesDate = !dateRange.start || !dateRange.end || 
                          (new Date(test.createdAt._seconds * 1000) >= new Date(dateRange.start) &&
                           new Date(test.createdAt._seconds * 1000) <= new Date(dateRange.end));
        
        return matchesSearch && matchesStatus && matchesType && matchesDate;
      })
      .sort((a, b) => {
        const [field, direction] = sortOption.split('-');
        const multiplier = direction === 'desc' ? -1 : 1;
        
        if (field === 'created') {
          return multiplier * (a.createdAt._seconds - b.createdAt._seconds);
        }
        return multiplier * a[field].localeCompare(b[field]);
      });
  }, [tests, searchTerm, filters, selectedTypes, dateRange, sortOption]);

  // Add fetch function
  const fetchTests = async () => {
    try {
      const orgId = organization?.id; // Assuming you have a function to get current org ID
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgId}/tests`);
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useEffect to fetch on component mount
  useEffect(() => {
    fetchTests();
  }, [organization]);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = storedDarkMode !== null 
      ? storedDarkMode === 'true' 
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // Replace sidebar toggle with actual data handling
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add handler for test click
  const handleTestClick = (testId) => {
    router.push(`/phishing/tests/active/${testId}`);
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Status', 'Scope', 'Created Date', 'Target Count', 'Click Rate', 'Report Rate'];
    const csvData = filteredAndSortedTests.map(test => [
      test.id,
      test.type,
      test.state,
      test.scope,
      new Date(test.createdAt._seconds * 1000).toLocaleDateString(),
      test.stats?.targetCount || 0,
      test.stats?.clickRate || '0%',
      test.stats?.reportRate || '0%'
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phishing-tests-${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <SignedIn>
      <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarToggle} darkMode={darkMode}>
        </Sidebar>

        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : ''}`}>
          <Navbar>
            <div className="flex items-center">
              {!sidebarOpen && (
                <Button onClick={handleSidebarToggle} className="mr-4 cursor-pointer text-neutral-800 dark:text-white" color="neutral">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              )}
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Active Tests</h1>
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
                  {darkMode ? '🌙' : '️'}
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
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header with stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl">
                      <h3 className="text-sm text-neutral-500">Total Tests</h3>
                      <p className="text-2xl font-semibold dark:text-white">{tests.length}</p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl">
                      <h3 className="text-sm text-neutral-500">Active Tests</h3>
                      <p className="text-2xl font-semibold dark:text-white">
                        {tests.filter(t => t.state === 'Live' || t.state === 'IN_PROGRESS').length}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl">
                      <h3 className="text-sm text-neutral-500">Avg. Click Rate</h3>
                      <p className="text-2xl font-semibold dark:text-white">
                        {`${Math.round(tests.reduce((acc, test) => acc + (parseFloat(test.stats?.clickRate) || 0), 0) / tests.length)}%`}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl">
                      <h3 className="text-sm text-neutral-500">Avg. Report Rate</h3>
                      <p className="text-2xl font-semibold dark:text-white">
                        {`${Math.round(tests.reduce((acc, test) => acc + (parseFloat(test.stats?.reportRate) || 0), 0) / tests.length)}%`}
                      </p>
                    </div>
                  </div>

                  {/* Control Panel */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex-1 w-full md:w-auto">
                      <SearchBar 
                        value={searchTerm} 
                        onChange={handleSearch}
                        resultsCount={filteredAndSortedTests.length}
                      />
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="px-4 pr-12 py-2 bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200/10 dark:text-white 
                        appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] 
                        bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat"
                      >
                        {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => setFilterPanelOpen(true)}
                        className="px-4 py-2 bg-white dark:bg-neutral-800/50 dark:text-white rounded-xl border border-neutral-200/10"
                      >
                        <Filter className="h-5 w-5" />
                      </button>

                      <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white dark:bg-neutral-800/50 dark:text-white rounded-xl border border-neutral-200/10"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  {filteredAndSortedTests.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                      <h3 className="text-lg font-medium dark:text-white mb-2">No tests found</h3>
                      <p className="text-neutral-500">Try adjusting your filters or search terms</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {filteredAndSortedTests.map(test => (
                        <TestCard key={test.id} test={test} onClick={() => handleTestClick(test.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            isOpen={filterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
          />
        </div>
      </div>
    </SignedIn>
  );
};

export default ActiveTests;
