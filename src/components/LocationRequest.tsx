
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Sun, CloudSun, LoaderCircle } from 'lucide-react';

interface LocationRequestProps {
  onRequestLocation: () => void;
  isLoading: boolean;
  loadingPercentage?: number;
  loadingStatus?: string;
}

const LocationRequest: React.FC<LocationRequestProps> = ({ 
  onRequestLocation, 
  isLoading, 
  loadingPercentage = 0,
  loadingStatus = ""
}) => {
  return (
    <div className="flex flex-col items-center p-8 pt-10 gap-8">
      <div className="flex justify-center items-center gap-3 text-blue-500 animate-pulse">
        <CloudSun size={32} className="text-blue-400" />
        <Sun size={40} />
        <CloudSun size={32} className="text-blue-400" />
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Discover Your Weather</h3>
        <p className="text-gray-600 text-center max-w-md leading-relaxed">
          Share your location to check the current weather conditions and get personalized updates for your area
        </p>
      </div>
      
      {!isLoading ? (
        <Button 
          onClick={onRequestLocation} 
          className="px-8 py-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-blue-300/30 hover:shadow-xl"
        >
          <span className="flex items-center gap-2 text-base">
            <MapPin size={20} />
            <span>Check My Weather</span>
          </span>
        </Button>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-full mb-2">
            <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="absolute top-0 h-full left-0 bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${loadingPercentage}%` }}
              />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {loadingPercentage}%
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-3 py-2 px-4 bg-blue-50 rounded-lg text-blue-700 w-full">
            <LoaderCircle size={20} className="animate-spin" />
            <p className="font-medium">{loadingStatus || "Processing..."}</p>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Your location data is used only for weather information
      </p>
    </div>
  );
};

export default LocationRequest;
