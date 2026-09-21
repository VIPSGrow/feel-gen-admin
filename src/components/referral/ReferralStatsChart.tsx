"use client";
import React from "react";

const ReferralStatsChart = () => {
  // Mock data for referrals over time
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const signupsData = [120, 190, 300, 500, 200, 300];
  const levelsData = [
    { name: 'Level 1', value: 45 },
    { name: 'Level 2', value: 26 },
    { name: 'Level 3', value: 18 },
    { name: 'Level 4+', value: 11 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart - Referrals Over Time */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 className="font-bold text-lg text-gray-800 mb-6 dark:text-white/90">New Referrals Over Time</h4>
        <div className="h-72 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-6 dark:from-blue-900/20 dark:to-emerald-900/20">
          {/* Mock line chart using CSS bars */}
          <div className="space-y-2">
            {months.map((month, index) => (
              <div key={month} className="flex items-end gap-2 h-16">
                <span className="text-sm font-medium text-gray-500 min-w-12 dark:text-gray-400">{month}</span>
                <div className="flex-1 bg-gray-200 rounded-lg h-12 relative dark:bg-gray-800">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-emerald-500 rounded-lg shadow-lg transition-all duration-500" 
                    style={{ height: `${(signupsData[index] / 500) * 100}%`, minHeight: '20%' }}
                  />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-800 shadow-md dark:bg-gray-900 dark:text-white">
                    {signupsData[index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pie Chart - Downline Levels */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 className="font-bold text-lg text-gray-800 mb-6 dark:text-white/90">Downline Distribution</h4>
        <div className="relative">
          {/* Mock pie chart using concentric circles */}
          <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 w-full h-full bg-gradient-circular from-purple-500 via-pink-500 to-orange-500 rounded-full animate-spin-slow shadow-xl blur-sm opacity-75" style={{animationDuration: '20s'}} />
            <div className="absolute inset-4 bg-white rounded-full shadow-lg dark:bg-gray-900" />
            <div className="absolute inset-8 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-2xl font-bold flex items-center justify-center rounded-full shadow-2xl">
              892
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          {levelsData.map((level, index) => (
            <div key={level.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl dark:bg-gray-900/50">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 90}, 70%, 60%)` }} />
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">{level.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{level.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralStatsChart;

