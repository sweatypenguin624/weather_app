
import React, { useEffect, useState } from 'react';

interface WelcomeProps {
  onComplete: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-100 transition-opacity duration-500 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg slide-up">
        Hello There!
      </h1>
    </div>
  );
};

export default Welcome;
