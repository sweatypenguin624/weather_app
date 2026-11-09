import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  ThermometerSun,
  Droplets,
  Wind,
  ArrowLeft,
  MapPin,
} from 'lucide-react';

import type { WeatherData } from '@/services/weatherService';

interface WeatherResultProps {
  location: string;
  weatherData: WeatherData;
  onChangeLocation: () => void;
}

// Generate a quirky message based on actual weather conditions
const getWeatherMessage = (weather: WeatherData): string => {
  const code = weather.icon;
  const temp = weather.temperature;
  const windSpeed = weather.windSpeed;

  if (code >= 95) {
    return "Thunder's having a concert today. Best to stay indoors!";
  }

  if (code === 45 || code === 48) {
    return "A little mysterious today, isn't it? It's foggy outside!";
  }

  if (code >= 71 && code <= 77) {
    return "Snowflakes outside, cosy vibes inside. Sounds like a plan!";
  }

  if (code >= 80 && code <= 82) {
    return "Surprise! The sky has plans of its own. Better grab an umbrella!";
  }

  if (
    code === 61 || code === 63 || code === 65 ||
    code === 66 || code === 67
  ) {
    return "The clouds are having a meltdown. Hope you brought an umbrella!";
  }

  if (code >= 51 && code <= 57) {
    return "Not quite rain, not quite dry. The sky can't make up its mind!";
  }

  if (windSpeed >= 30) {
    return "Your hair paired with the wind is going to be the unpaid actor today!";
  }

  if (temp >= 38) {
    return "The Sun is working overtime! Stay hydrated and avoid the heat.";
  }

  if (temp >= 33) {
    return "It's getting hot! Maybe ice cream deserves a place in your plans.";
  }

  if (temp <= 10) {
    return "Your blanket called. It wants you back inside!";
  }

  if (code === 0) {
    return "The sky is showing off today. Go enjoy that sunshine!";
  }

  if (code === 1 || code === 2) {
    return "A little sun, a little shade. The sky is keeping things balanced!";
  }

  if (code === 3) {
    return "The sky's gone into its grey-and-moody era.";
  }

  return "Well, that's something we don't see every day!";
};

// Select an icon based on the weather code
const getWeatherIcon = (code: number) => {
  if (code === 0) return Sun;
  if (code === 1 || code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return Snowflake;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 95) return CloudLightning;

  return CloudSun;
};

const WeatherResult: React.FC<WeatherResultProps> = ({
  location,
  weatherData,
  onChangeLocation,
}) => {
  const WeatherIcon = getWeatherIcon(weatherData.icon);
  const weatherMessage = getWeatherMessage(weatherData);

  return (
    <div className="p-8 pt-6 slide-up">
      <div className="relative">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30">
          <div className="flex items-center text-white">
            <WeatherIcon size={48} />
          </div>
        </div>
      </div>

      <div className="mt-14 text-center">

        {/* Heading */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <CloudSun size={20} className="text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">
            Weather Found!
          </h2>
        </div>

        {/* Location */}
        <div className="mb-6 bg-blue-50/70 py-3 px-4 rounded-lg shadow-inner">
          <p className="text-sm text-gray-600">
            Your Location
          </p>

          <p className="text-lg font-medium text-gray-800 tracking-wide">
            {location}
          </p>
        </div>

        {/* Main temperature */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/60 p-5 rounded-xl mb-4 shadow-inner">
          <p className="text-6xl font-bold text-gray-800">
            {weatherData.temperature}°C
          </p>

          <p className="text-lg font-semibold text-gray-700 mt-2">
            {weatherData.condition}
          </p>

          <p className="text-sm text-gray-600 mt-2">
            Feels like {weatherData.feelsLike}°C
          </p>

          <div className="flex justify-center gap-5 mt-4 text-sm text-gray-600">
            <span>↓ {weatherData.tempMin}°C</span>
            <span>↑ {weatherData.tempMax}°C</span>
          </div>
        </div>

        {/* Additional weather details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/80 p-4 rounded-xl shadow-sm">
            <Droplets className="mx-auto text-blue-500 mb-2" size={24} />

            <p className="text-sm text-gray-500">Humidity</p>

            <p className="text-xl font-bold text-gray-800">
              {weatherData.humidity}%
            </p>
          </div>

          <div className="bg-white/80 p-4 rounded-xl shadow-sm">
            <Wind className="mx-auto text-blue-500 mb-2" size={24} />

            <p className="text-sm text-gray-500">Wind Speed</p>

            <p className="text-xl font-bold text-gray-800">
              {weatherData.windSpeed} km/h
            </p>
          </div>
        </div>

        {/* Quirky weather message */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/60 p-5 rounded-xl mb-4 shadow-inner">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ThermometerSun size={18} className="text-orange-400" />

            <p className="font-medium text-gray-700">
              Today's Weather Vibe
            </p>
          </div>

          <p className="text-lg font-bold text-gray-800 leading-relaxed">
            "{weatherMessage}"
          </p>
        </div>

        {/* Change location button */}
        <button
          type="button"
          onClick={onChangeLocation}
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 transition-colors duration-200 shadow-md"
        >
          <ArrowLeft size={18} />
          <MapPin size={18} />
          Change Location
        </button>

        {/* Decorative dots */}
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