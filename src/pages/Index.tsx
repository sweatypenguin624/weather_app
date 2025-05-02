
import React, { useState } from 'react';
import Welcome from '@/components/Welcome';
import WeatherApp from '@/components/WeatherApp';

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen weather-gradient">
      {showWelcome && <Welcome onComplete={handleWelcomeComplete} />}
      <div className={`transition-opacity duration-500 ${showWelcome ? 'opacity-0' : 'opacity-100 fade-in'}`}>
        <WeatherApp />
      </div>
    </div>
  );
};

export default Index;
