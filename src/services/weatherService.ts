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

export interface CityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
  }[];
}

interface ReverseGeocodingResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Heavy thunderstorm with hail',
  };

  return descriptions[code] ?? 'Unknown weather condition';
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  city = 'Your location'
): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');

  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '1',
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to fetch weather data. Please try again.');
  }

  const data: OpenMeteoResponse = await response.json();

  return {
    city,
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    condition: getWeatherDescription(data.current.weather_code),
    description: getWeatherDescription(data.current.weather_code),
    icon: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    tempMin: Math.round(data.daily.temperature_2m_min[0]),
    tempMax: Math.round(data.daily.temperature_2m_max[0]),
  };
}

export async function fetchCityName(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const url = new URL(
      'https://api.bigdatacloud.net/data/reverse-geocode-client'
    );

    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('localityLanguage', 'en');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Unable to fetch location name');
    }

    const data: ReverseGeocodingResponse = await response.json();

    return (
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      'Your location'
    );
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return 'Your location';
  }
}

export async function searchCity(
  cityName: string
): Promise<CityCoordinates> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');

  url.search = new URLSearchParams({
    name: cityName,
    count: '1',
    language: 'en',
    format: 'json',
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to search for this city. Please try again.');
  }

  const data: GeocodingResponse = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('City not found. Please check the spelling and try again.');
  }

  const result = data.results[0];

  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
  };
}