
export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: number;
  humidity: number;
  windSpeed: number;
  tempMin: number;
  tempMax: number;
}

// Dummy data for testing the UI
export const dummyWeatherData: WeatherData = {
  city: "Bengaluru",
  temperature: 27,
  feelsLike: 29,
  condition:  "Snowy",
  description: "Snowy conditions with strong winds",
  icon: 71, // Placeholder icon name; 
  humidity: 65,
  windSpeed: 12,
  tempMin: 21,
  tempMax: 29,
};

