
import React from 'react';
import { Sun, CloudSun, ThermometerSun } from 'lucide-react';

interface WeatherResultProps {
  location: string;
}

const WeatherResult: React.FC<WeatherResultProps> = ({ location }) => {
  return (
    <div className="p-8 pt-6 slide-up">
      <div className="relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30">
          <div className="flex items-center text-white">
            <Sun size={48} />
          </div>
        </div>
      </div>
      
      <div className="mt-14 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CloudSun size={20} className="text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Weather Found!</h2>
        </div>
        
        <div className="mb-6 bg-blue-50/70 py-3 px-4 rounded-lg shadow-inner">
          <p className="text-sm text-gray-600">
            Your Location
          </p>
          <p className="text-lg font-medium text-gray-800 tracking-wide">
            {location}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/60 p-5 rounded-xl mb-4 shadow-inner">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ThermometerSun size={18} className="text-orange-400" />
            <p className="font-medium text-gray-700">Today's Weather</p>
          </div>
          <p className="text-xl font-bold text-gray-800 leading-relaxed">
            "Baahar jaake dekh le"
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-1 text-blue-400 mt-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full opacity-30"></span>
          <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
          <span className="w-2 h-2 bg-blue-400 rounded-full opacity-30"></span>
        </div>
      </div>
    </div>
  );
};

export default WeatherResult;
