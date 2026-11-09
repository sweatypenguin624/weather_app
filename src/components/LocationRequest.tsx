import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Sun,
  CloudSun,
  LoaderCircle,
  Search,
} from 'lucide-react';

interface LocationRequestProps {
  onRequestLocation: () => void;
  onSearchCity: (city: string) => void;
  isLoading: boolean;
  isSearching: boolean;
  loadingPercentage?: number;
  loadingStatus?: string;
}

const LocationRequest: React.FC<LocationRequestProps> = ({
  onRequestLocation,
  onSearchCity,
  isLoading,
  isSearching,
  loadingPercentage = 0,
  loadingStatus = '',
}) => {
  const [city, setCity] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (trimmedCity) {
      onSearchCity(trimmedCity);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 pt-10 gap-8">
      <div className="flex justify-center items-center gap-3 text-blue-500 animate-pulse">
        <CloudSun size={32} className="text-blue-400" />
        <Sun size={40} />
        <CloudSun size={32} className="text-blue-400" />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Discover Your Weather
        </h3>

        <p className="text-gray-600 text-center max-w-md leading-relaxed">
          Share your location or search for a city to check its current
          weather conditions.
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-5">
        <Button
          onClick={onRequestLocation}
          disabled={isLoading || isSearching}
          className="w-full px-8 py-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-blue-300/30 hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-base">
              <LoaderCircle size={20} className="animate-spin" />
              Detecting Location...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-base">
              <MapPin size={20} />
              Check My Weather
            </span>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label
            htmlFor="city-search"
            className="text-sm font-medium text-gray-700"
          >
            Search by city
          </label>

          <input
            id="city-search"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Enter city name..."
            disabled={isLoading || isSearching}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80"
          />

          <Button
            type="submit"
            disabled={!city.trim() || isLoading || isSearching}
            className="w-full px-8 py-6 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <LoaderCircle size={20} className="animate-spin" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search size={20} />
                Search Weather
              </span>
            )}
          </Button>
        </form>
      </div>

      {isLoading && (
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
            <p className="font-medium">
              {loadingStatus || 'Processing...'}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        Your location is used only to provide weather information.
      </p>
    </div>
  );
};

export default LocationRequest;