import React, { useState, useEffect } from 'react';
import LocationRequest from './LocationRequest';
import WeatherResult from './WeatherResult';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const loadingSteps = [
  { message: "Detecting your location...", percentage: 20 },
  { message: "Analyzing cloud patterns...", percentage: 40 },
  { message: "Checking atmospheric conditions...", percentage: 60 },
  { message: "Gathering weather reports...", percentage: 80 },
  { message: "Preparing your forecast...", percentage: 95 },
  { message: "Complete!", percentage: 100 } // Added final step to reach 100%
];

const WeatherApp: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const { toast } = useToast();

  // Progress through loading steps
  useEffect(() => {
    if (!isLoading || loadingStep >= loadingSteps.length) return;
    
    const currentStep = loadingSteps[loadingStep];
    setLoadingStatus(currentStep.message);
    
    // Animate percentage from previous to current
    const prevPercentage = loadingStep > 0 ? loadingSteps[loadingStep - 1].percentage : 0;
    const targetPercentage = currentStep.percentage;
    const duration = 1000; // 1 second for each step
    const startTime = Date.now();
    
    const animatePercentage = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentPercentage = prevPercentage + (targetPercentage - prevPercentage) * progress;
      
      setLoadingPercentage(Math.round(currentPercentage));
      
      if (progress < 1) {
        requestAnimationFrame(animatePercentage);
      } else if (loadingStep < loadingSteps.length - 1) {
        // Move to next step after a delay
        setTimeout(() => setLoadingStep(prev => prev + 1), 800);
      } else {
        // This is the completion step (now the last step with 100%)
        setTimeout(() => {
          setIsLoading(false); // End loading state
        }, 500);
      }
    };
    
    requestAnimationFrame(animatePercentage);
  }, [isLoading, loadingStep]);

  const handleRequestLocation = () => {
    setIsLoading(true);
    setLoadingStep(0);
    setLoadingPercentage(0);
    setLoadingStatus(loadingSteps[0].message);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get location immediately, but keep the loading animation going
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          
          // Continue with loading animation
          // After loading completes, the effect will set isLoading to false
          // and the location will be displayed
          setTimeout(() => {
            setLocation(locationString);
          }, 1000);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Please enable location services to check the weather",
            variant: "destructive",
          });

          // Set fallback location after error and stop loading
          setTimeout(() => {
            setIsLoading(false);
            setLocation("Unknown Location");
          }, 500);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      
      // Set fallback location if geolocation not supported
      setTimeout(() => {
        setIsLoading(false);
        setLocation("Unknown Location");
      }, 500);
    }
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
          {!location ? (
            <LocationRequest 
              onRequestLocation={handleRequestLocation} 
              isLoading={isLoading}
              loadingPercentage={loadingPercentage}
              loadingStatus={loadingStatus}
            />
          ) : (
            <WeatherResult location={location} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherApp;
