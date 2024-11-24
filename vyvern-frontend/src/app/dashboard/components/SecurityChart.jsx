'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const SecurityChart = ({ tests }) => {
  // Process test data into chart format
  const processTestData = () => {
    if (!tests?.length) return [];

    // Sort tests by date and group by day
    const dailyData = tests
      .sort((a, b) => a.createdAt._seconds - b.createdAt._seconds)
      .reduce((acc, test) => {
        const date = new Date(test.createdAt._seconds * 1000).toLocaleDateString();
        
        if (!acc[date]) {
          acc[date] = {
            date,
            clickRate: 0,
            completionRate: 0,
            tests: []
          };
        }
        
        acc[date].tests.push(test);
        return acc;
      }, {});

    // Calculate metrics for each day
    return Object.values(dailyData).map(day => ({
      date: day.date,
      clickRate: calculateDailyClickRate(day.tests),
      completionRate: calculateDailyCompletionRate(day.tests),
      securityScore: calculateDailySecurityScore(day.tests)
    }));
  };

  const calculateDailyClickRate = (dailyTests) => {
    const completed = dailyTests.filter(test => test.state === "Completed");
    if (!completed.length) return 100;
    const clicked = completed.filter(test => test.clicked);
    return Math.round(100 - (clicked.length / completed.length * 100));
  };

  const calculateDailyCompletionRate = (dailyTests) => {
    return Math.round((dailyTests.filter(test => test.state === "Completed").length / dailyTests.length) * 100);
  };

  const calculateDailySecurityScore = (dailyTests) => {
    // Simplified security score calculation for the chart
    return Math.round((calculateDailyClickRate(dailyTests) * 0.6) + 
           (calculateDailyCompletionRate(dailyTests) * 0.4));
  };

  const data = processTestData();

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Security Metrics Over Time</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="securityScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
            <XAxis 
              dataKey="date" 
              className="dark:text-neutral-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="dark:text-neutral-400"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgb(38 38 38)', 
                border: 'none',
                borderRadius: '0.375rem',
                color: 'white'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="securityScore"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#securityScore)"
              name="Security Score"
            />
            <Line 
              type="monotone" 
              dataKey="clickRate" 
              stroke="#3b82f6" 
              name="Click Resistance"
            />
            <Line 
              type="monotone" 
              dataKey="completionRate" 
              stroke="#22c55e"
              name="Completion Rate" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SecurityChart; 