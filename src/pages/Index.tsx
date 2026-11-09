import React, { useState } from 'react';
import Welcome from '@/components/Welcome';
import WeatherApp from '@/components/WeatherApp';
import WeatherPlanner from '@/components/WeatherPlanner';
import Forecast from '@/components/Forecast';
import { CloudSun, BarChart2, CalendarDays } from 'lucide-react';

export type DashboardTab = 'forecast' | 'metrics' | 'planner';

const TABS: { id: DashboardTab; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'forecast',
    label: 'Forecast & Hourly',
    icon: <CloudSun className="w-4 h-4" />,
    desc: 'AI overview, hourly slider & 5-day outlook',
  },
  {
    id: 'metrics',
    label: 'Metrics & Air Quality',
    icon: <BarChart2 className="w-4 h-4" />,
    desc: 'AQI, UV index, wind compass & sun cycle',
  },
  {
    id: 'planner',
    label: 'Smart Day Planner',
    icon: <CalendarDays className="w-4 h-4" />,
    desc: 'Activity optimizer & outfit recommendations',
  },
];

const Index: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('forecast');

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen weather-gradient pb-16">
      {showWelcome && <Welcome onComplete={handleWelcomeComplete} />}
      <div className={`transition-opacity duration-500 ${showWelcome ? 'opacity-0' : 'opacity-100 fade-in'}`}>
        <WeatherApp />

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-6 sm:mt-8 relative z-10">
          {/* Pill Tab Bar */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 p-1.5 sm:p-2">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-gray-400'}>{tab.icon}</span>
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                    <span className="sm:hidden text-[11px] leading-tight text-center w-full">
                      {tab.id === 'forecast' ? 'Forecast' : tab.id === 'metrics' ? 'Metrics' : 'Planner'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content with fade-in animation */}
          <div key={activeTab} className="fade-in">
            {activeTab !== 'planner' && (
              <Forecast activeTab={activeTab} />
            )}
            {activeTab === 'planner' && (
              <WeatherPlanner />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
