import React, { useState, useEffect } from 'react';
import LocationRequest from './LocationRequest';
import WeatherResult from './WeatherResult';
import {
  fetchWeather,
  fetchCityName,
  searchCity,
  type WeatherData,
} from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const loadingSteps = [
  { message: 'Detecting your location...', percentage: 20 },
  { message: 'Analyzing cloud patterns...', percentage: 40 },
  { message: 'Checking atmospheric conditions...', percentage: 60 },
  { message: 'Gathering weather reports...', percentage: 80 },
  { message: 'Preparing your forecast...', percentage: 95 },
  { message: 'Complete!', percentage: 100 },
];

const WeatherApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading || loadingStep >= loadingSteps.length) return;

    const currentStep = loadingSteps[loadingStep];
    setLoadingStatus(currentStep.message);

    const prevPercentage =
      loadingStep > 0 ? loadingSteps[loadingStep - 1].percentage : 0;

    const targetPercentage = currentStep.percentage;
    const duration = 1000;
    const startTime = Date.now();

    const animatePercentage = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentPercentage =
        prevPercentage + (targetPercentage - prevPercentage) * progress;

      setLoadingPercentage(Math.round(currentPercentage));

      if (progress < 1) {
        requestAnimationFrame(animatePercentage);
      } else if (loadingStep < loadingSteps.length - 1) {
        setTimeout(() => setLoadingStep((prev) => prev + 1), 800);
      } else {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    requestAnimationFrame(animatePercentage);
  }, [isLoading, loadingStep]);

  // Detect user's current location
  const handleRequestLocation = () => {
    setIsLoading(true);
    setLoadingStep(0);
    setLoadingPercentage(0);
    setLoadingStatus(loadingSteps[0].message);
    setLocation(null);
    setWeatherData(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const city = await fetchCityName(latitude, longitude);
            const weather = await fetchWeather(latitude, longitude, city);

            setWeatherData(weather);
            setLocation(weather.city);
          } catch (error) {
            console.error('Error fetching weather:', error);

            toast({
              title: 'Weather unavailable',
              description: "Couldn't fetch weather data. Please try again.",
              variant: 'destructive',
            });

            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);

          toast({
            title: 'Location access failed',
            description: 'Please enable location services and try again.',
            variant: 'destructive',
          });

          setIsLoading(false);
        }
      );
    } else {
      toast({
        title: 'Geolocation not supported',
        description: "Your browser doesn't support location services.",
        variant: 'destructive',
      });

      setIsLoading(false);
    }
  };

  // Search weather by city name
  const handleSearchCity = async (cityName: string) => {
    setIsSearching(true);
    setLocation(null);
    setWeatherData(null);

    try {
      const city = await searchCity(cityName);

      const weather = await fetchWeather(
        city.latitude,
        city.longitude,
        city.name
      );

      setWeatherData(weather);
      setLocation(weather.city);
    } catch (error) {
      console.error('City search failed:', error);

      toast({
        title: 'City search failed',
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Return to the location and city search screen
  const handleChangeLocation = () => {
    setLocation(null);
    setWeatherData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-100 to-white flex flex-col items-center justify-start pt-10 md:pt-16 pb-16 px-4">
      <div className="text-center mb-8 slide-up">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400 drop-shadow-md">
          SkyCheck Weather
        </h1>

        <p className="text-gray-600 mt-3 max-w-md mx-auto text-lg">
          Your personal weather companion
        </p>
      </div>

      <Card className="w-full max-w-md bg-white/70 backdrop-blur-sm border-white/50 shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-3"></div>

        <CardContent className="p-0">
          {!location || !weatherData ? (
            <LocationRequest
              onRequestLocation={handleRequestLocation}
              onSearchCity={handleSearchCity}
              isLoading={isLoading}
              isSearching={isSearching}
              loadingPercentage={loadingPercentage}
              loadingStatus={loadingStatus}
            />
          ) : (
            <WeatherResult
              location={location}
              weatherData={weatherData}
              onChangeLocation={handleChangeLocation}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherApp;