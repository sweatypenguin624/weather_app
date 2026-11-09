import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Eye,
  Gauge,
  LayoutGrid,
  List,
  Navigation,
  Sunrise,
  Sunset,
  Activity,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  fetchWeatherNarrative,
  generateFallbackNarrative,
} from '@/services/openRouterService';
import type { DashboardTab } from '@/pages/Index';

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: string;
  pop: number; // Probability of precipitation (%)
  humidity: number; // Humidity (%)
  feelsLike?: number;
  windSpeed?: string;
  uvIndex?: number;
}

export interface DailyForecast {
  day: string;
  date?: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  rainChance: number;
  humidity?: number;
  windSpeed?: string;
}

export interface AirQuality {
  aqi: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  o3?: number; // ppb
  no2?: number; // ppb
}

export interface WindDetails {
  speed: string; // e.g. "14 km/h"
  direction: string; // e.g. "NW"
  degrees: number; // 0 - 360
  gusts: string; // e.g. "24 km/h"
}

export interface SunCycle {
  sunrise: string;
  sunset: string;
  dawn?: string;
  dusk?: string;
  daylightDuration?: string;
}

export interface AdditionalMetrics {
  humidity: number;
  windSpeed: string;
  uvIndex: number;
  feelsLike: number;
  visibility: string;
  pressure: string;
  airQuality?: AirQuality;
  windDetails?: WindDetails;
  sunCycle?: SunCycle;
  sunrise?: string;
  sunset?: string;
}

export interface ForecastProps {
  hourly?: HourlyForecast[];
  daily?: DailyForecast[];
  metrics?: AdditionalMetrics;
  activeTab?: DashboardTab;
}

const defaultHourly: HourlyForecast[] = [
  { time: '12:00 AM', temp: 19, condition: 'Clear Night', icon: '🌙', pop: 0, humidity: 74, feelsLike: 19, windSpeed: '8 km/h' },
  { time: '01:00 AM', temp: 18, condition: 'Clear Night', icon: '🌙', pop: 0, humidity: 76, feelsLike: 18, windSpeed: '7 km/h' },
  { time: '02:00 AM', temp: 18, condition: 'Clear Night', icon: '🌙', pop: 0, humidity: 78, feelsLike: 18, windSpeed: '7 km/h' },
  { time: '03:00 AM', temp: 17, condition: 'Clear Night', icon: '🌙', pop: 5, humidity: 80, feelsLike: 17, windSpeed: '6 km/h' },
  { time: '04:00 AM', temp: 17, condition: 'Partly Cloudy', icon: '☁️', pop: 5, humidity: 82, feelsLike: 17, windSpeed: '6 km/h' },
  { time: '05:00 AM', temp: 18, condition: 'Partly Cloudy', icon: '☁️', pop: 10, humidity: 80, feelsLike: 18, windSpeed: '7 km/h' },
  { time: '06:00 AM', temp: 19, condition: 'Sunrise', icon: '🌅', pop: 10, humidity: 76, feelsLike: 19, windSpeed: '8 km/h' },
  { time: '07:00 AM', temp: 21, condition: 'Sunny', icon: '☀️', pop: 5, humidity: 70, feelsLike: 21, windSpeed: '10 km/h' },
  { time: '08:00 AM', temp: 23, condition: 'Sunny', icon: '☀️', pop: 5, humidity: 64, feelsLike: 23, windSpeed: '11 km/h' },
  { time: '09:00 AM', temp: 25, condition: 'Mostly Sunny', icon: '🌤️', pop: 10, humidity: 58, feelsLike: 26, windSpeed: '12 km/h' },
  { time: '10:00 AM', temp: 27, condition: 'Sunny', icon: '☀️', pop: 10, humidity: 52, feelsLike: 28, windSpeed: '13 km/h' },
  { time: '11:00 AM', temp: 29, condition: 'Partly Cloudy', icon: '⛅', pop: 15, humidity: 48, feelsLike: 31, windSpeed: '14 km/h' },
  { time: '12:00 PM', temp: 30, condition: 'Partly Cloudy', icon: '⛅', pop: 20, humidity: 44, feelsLike: 32, windSpeed: '15 km/h' },
  { time: '01:00 PM', temp: 31, condition: 'Passing Clouds', icon: '⛅', pop: 25, humidity: 42, feelsLike: 33, windSpeed: '16 km/h' },
  { time: '02:00 PM', temp: 31, condition: 'Scattered Showers', icon: '🌦️', pop: 45, humidity: 50, feelsLike: 34, windSpeed: '18 km/h' },
  { time: '03:00 PM', temp: 29, condition: 'Light Rain', icon: '🌧️', pop: 60, humidity: 64, feelsLike: 31, windSpeed: '17 km/h' },
  { time: '04:00 PM', temp: 28, condition: 'Overcast', icon: '☁️', pop: 40, humidity: 60, feelsLike: 29, windSpeed: '15 km/h' },
  { time: '05:00 PM', temp: 27, condition: 'Clearing Up', icon: '🌤️', pop: 25, humidity: 56, feelsLike: 28, windSpeed: '14 km/h' },
  { time: '06:00 PM', temp: 25, condition: 'Sunset', icon: '🌇', pop: 15, humidity: 60, feelsLike: 26, windSpeed: '12 km/h' },
  { time: '07:00 PM', temp: 24, condition: 'Clear Evening', icon: '🌙', pop: 10, humidity: 64, feelsLike: 25, windSpeed: '10 km/h' },
  { time: '08:00 PM', temp: 23, condition: 'Clear', icon: '🌙', pop: 5, humidity: 67, feelsLike: 24, windSpeed: '9 km/h' },
  { time: '09:00 PM', temp: 22, condition: 'Clear', icon: '🌙', pop: 5, humidity: 69, feelsLike: 22, windSpeed: '8 km/h' },
  { time: '10:00 PM', temp: 21, condition: 'Clear', icon: '🌙', pop: 0, humidity: 71, feelsLike: 21, windSpeed: '8 km/h' },
  { time: '11:00 PM', temp: 20, condition: 'Clear', icon: '🌙', pop: 0, humidity: 73, feelsLike: 20, windSpeed: '7 km/h' },
];

const defaultDaily: DailyForecast[] = [
  { day: 'Today', date: 'Nov 9', tempMax: 31, tempMin: 18, condition: 'Scattered Showers', icon: '🌦️', rainChance: 45, humidity: 52, windSpeed: '18 km/h' },
  { day: 'Tue', date: 'Nov 10', tempMax: 28, tempMin: 17, condition: 'Partly Cloudy', icon: '⛅', rainChance: 20, humidity: 48, windSpeed: '14 km/h' },
  { day: 'Wed', date: 'Nov 11', tempMax: 26, tempMin: 16, condition: 'Light Rain', icon: '🌧️', rainChance: 65, humidity: 68, windSpeed: '17 km/h' },
  { day: 'Thu', date: 'Nov 12', tempMax: 27, tempMin: 17, condition: 'Overcast', icon: '☁️', rainChance: 25, humidity: 56, windSpeed: '12 km/h' },
  { day: 'Fri', date: 'Nov 13', tempMax: 29, tempMin: 19, condition: 'Sunny & Clear', icon: '☀️', rainChance: 10, humidity: 45, windSpeed: '10 km/h' },
];

const defaultAirQuality: AirQuality = {
  aqi: 42,
  status: 'Good',
  pm25: 9.8,
  pm10: 18.4,
  o3: 28,
  no2: 14,
};

const defaultWindDetails: WindDetails = {
  speed: '14 km/h',
  direction: 'NW',
  degrees: 315,
  gusts: '24 km/h',
};

const defaultSunCycle: SunCycle = {
  sunrise: '06:14 AM',
  sunset: '05:48 PM',
  dawn: '05:49 AM',
  dusk: '06:13 PM',
  daylightDuration: '11h 34m',
};

const defaultMetrics: AdditionalMetrics = {
  humidity: 62,
  windSpeed: '14 km/h NW',
  uvIndex: 6,
  feelsLike: 31,
  visibility: '10 km',
  pressure: '1013 hPa',
  airQuality: defaultAirQuality,
  windDetails: defaultWindDetails,
  sunCycle: defaultSunCycle,
  sunrise: '06:14 AM',
  sunset: '05:48 PM',
};

const getAqiConfig = (aqi: number) => {
  if (aqi <= 50) {
    return {
      status: 'Good',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-500',
      description: 'Air quality is satisfactory with minimal health risk.',
      percentage: Math.min((aqi / 300) * 100, 100),
    };
  }
  if (aqi <= 100) {
    return {
      status: 'Moderate',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      description: 'Air quality is acceptable; unusually sensitive people should consider limiting outdoor exertion.',
      percentage: Math.min((aqi / 300) * 100, 100),
    };
  }
  if (aqi <= 150) {
    return {
      status: 'Unhealthy for Sensitive Groups',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      barColor: 'bg-orange-500',
      description: 'Members of sensitive groups may experience health effects.',
      percentage: Math.min((aqi / 300) * 100, 100),
    };
  }
  return {
    status: 'Unhealthy',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    barColor: 'bg-rose-500',
    description: 'Everyone may begin to experience health effects; limit prolonged outdoor exposure.',
    percentage: Math.min((aqi / 300) * 100, 100),
  };
};

const getUvAdvice = (uv: number) => {
  if (uv <= 2) {
    return {
      level: 'Low',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      advice: 'Low exposure risk. Enjoy outdoors safely without extra sun protection.',
      iconColor: 'text-emerald-500',
    };
  }
  if (uv <= 5) {
    return {
      level: 'Moderate',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      advice: 'Moderate exposure risk. Wear sunglasses, a sun hat, and apply SPF 15+ sunscreen.',
      iconColor: 'text-amber-500',
    };
  }
  if (uv <= 7) {
    return {
      level: 'High',
      badgeColor: 'text-orange-700 bg-orange-50 border-orange-200',
      advice: 'UV 6: SPF 30+ recommended, wear UV sunglasses & seek shade during midday hours.',
      iconColor: 'text-orange-500',
    };
  }
  if (uv <= 10) {
    return {
      level: 'Very High',
      badgeColor: 'text-red-700 bg-red-50 border-red-200',
      advice: 'Very high risk! Extra protection required. Minimize direct sun exposure between 10 AM and 4 PM.',
      iconColor: 'text-red-500',
    };
  }
  return {
    level: 'Extreme',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    advice: 'Extreme risk! Take all precautions: SPF 50+, protective clothing, sunglasses, and avoid midday sun.',
    iconColor: 'text-purple-500',
  };
};

export const Forecast: React.FC<ForecastProps> = ({
  hourly = defaultHourly,
  daily = defaultDaily,
  metrics = defaultMetrics,
  activeTab = 'forecast',
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(null);
  const [dailyViewMode, setDailyViewMode] = useState<'list' | 'grid'>('list');

  const aqiData = metrics.airQuality || defaultAirQuality;
  const aqiConfig = getAqiConfig(aqiData.aqi);

  const uvConfig = getUvAdvice(metrics.uvIndex);

  const windData = metrics.windDetails || {
    speed: metrics.windSpeed || defaultWindDetails.speed,
    direction: defaultWindDetails.direction,
    degrees: defaultWindDetails.degrees,
    gusts: defaultWindDetails.gusts,
  };

  const sunData = metrics.sunCycle || {
    sunrise: metrics.sunrise || defaultSunCycle.sunrise,
    sunset: metrics.sunset || defaultSunCycle.sunset,
    dawn: defaultSunCycle.dawn,
    dusk: defaultSunCycle.dusk,
    daylightDuration: defaultSunCycle.daylightDuration,
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const selectedHour = selectedHourIndex !== null ? hourly[selectedHourIndex] : null;

  const [narrative, setNarrative] = useState<string>('');
  const [isLoadingNarrative, setIsLoadingNarrative] = useState<boolean>(true);

  const loadNarrative = useCallback(async () => {
    setIsLoadingNarrative(true);
    try {
      const today = daily[0] || defaultDaily[0];
      const result = await fetchWeatherNarrative({
        tempMax: today.tempMax,
        tempMin: today.tempMin,
        condition: today.condition,
        rainChance: today.rainChance,
        humidity: metrics.humidity,
        windSpeed: metrics.windSpeed,
        uvIndex: metrics.uvIndex,
        feelsLike: metrics.feelsLike,
      });
      setNarrative(result);
    } catch {
      const today = daily[0] || defaultDaily[0];
      setNarrative(
        generateFallbackNarrative({
          tempMax: today.tempMax,
          tempMin: today.tempMin,
          condition: today.condition,
          rainChance: today.rainChance,
          humidity: metrics.humidity,
          windSpeed: metrics.windSpeed,
          uvIndex: metrics.uvIndex,
          feelsLike: metrics.feelsLike,
        })
      );
    } finally {
      setIsLoadingNarrative(false);
    }
  }, [daily, metrics]);

  useEffect(() => {
    loadNarrative();
  }, [loadNarrative]);

  return (
    <section className="w-full max-w-7xl mx-auto space-y-5">
      {/* ───────────────────────────────────────────────────
          TAB 1: "Forecast & Hourly"
          Shows: AI Daily Overview · Hourly Slider · 5-Day Forecast
      ─────────────────────────────────────────────────── */}
      {activeTab === 'forecast' && (
        <>
          {/* AI Daily Overview */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">AI Daily Overview</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Conversational atmospheric summary for today
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadNarrative}
                disabled={isLoadingNarrative}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/90 hover:bg-white text-indigo-700 hover:text-indigo-900 border border-indigo-200/80 shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                title="Regenerate AI Narrative"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNarrative ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {isLoadingNarrative ? (
              <div className="py-2 space-y-2.5 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing today's forecast summary…</span>
                </div>
                <div className="h-4 bg-indigo-200/60 rounded-full w-full" />
                <div className="h-4 bg-indigo-200/40 rounded-full w-4/5" />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-medium">
                  &ldquo;{narrative}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-100/60 text-xs font-medium">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-indigo-100 text-gray-700">
                    <span>🌡️</span> High: <strong>{daily[0]?.tempMax ?? 31}°C</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-indigo-100 text-gray-700">
                    <span>💧</span> Rain Risk: <strong>{daily[0]?.rainChance ?? 45}%</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-indigo-100 text-gray-700">
                    <span>☀️</span> UV: <strong>{metrics.uvIndex} — {uvConfig.level}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 border border-indigo-100 text-gray-700">
                    <span>💨</span> Wind: <strong>{windData.speed} {windData.direction}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hourly Outlook */}
          <div className="p-5 sm:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Hourly Outlook</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Precipitation, temperature & humidity — hour by hour
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {selectedHour && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg hidden md:inline-block">
                    {selectedHour.time} · {selectedHour.temp}°C · {selectedHour.condition}
                  </span>
                )}
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => scrollSlider('left')}
                    className="p-1.5 rounded-lg bg-white shadow-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all active:scale-95"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider('right')}
                    className="p-1.5 rounded-lg bg-white shadow-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all active:scale-95"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={sliderRef}
              tabIndex={0}
              aria-label="24-hour weather forecast slider"
              className="overflow-x-auto flex gap-3 pb-3 pt-1 px-1 custom-scrollbar scroll-smooth outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 rounded-xl"
            >
              {hourly.map((item, index) => {
                const isSelected = selectedHourIndex === index;
                return (
                  <div
                    key={`${item.time}-${index}`}
                    onClick={() => setSelectedHourIndex(isSelected ? null : index)}
                    className={`flex-none w-[112px] sm:w-[122px] p-3 rounded-xl border transition-all duration-200 select-none cursor-pointer flex flex-col items-center justify-between text-center group ${
                      isSelected
                        ? 'bg-blue-50/95 border-blue-400 shadow-md -translate-y-1 scale-[1.02] ring-2 ring-blue-300'
                        : 'bg-white/70 hover:bg-white border-white/60 hover:border-blue-200 shadow-sm hover:shadow-md hover:-translate-y-1'
                    }`}
                  >
                    <span className="text-xs font-semibold text-gray-600">{item.time}</span>
                    <span className="text-3xl my-2 transform group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-sm font-bold text-gray-900">{item.temp}°C</span>

                    <div className="mt-1.5 w-full flex justify-center">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.pop >= 40 ? 'bg-blue-500 text-white' : item.pop > 0 ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-400'
                      }`}>
                        💧 {item.pop}%
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-500">
                      <Droplets className="w-3 h-3 text-blue-400" />
                      <span>{item.humidity}%</span>
                    </div>

                    <span className="mt-1 text-[10px] text-gray-400 truncate max-w-full">{item.condition}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="p-5 sm:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">5-Day Forecast</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Extended daily outlook & rain probability</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-gray-100/90 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDailyViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${dailyViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDailyViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${dailyViewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {dailyViewMode === 'list' ? (
              <div className="space-y-2">
                {daily.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white border border-white/50 hover:border-blue-200 shadow-sm hover:shadow transition-all group"
                  >
                    <div className="w-20 sm:w-24 text-left">
                      <span className="font-semibold text-sm text-gray-800 block">{item.day}</span>
                      {item.date && <span className="text-[11px] text-gray-400">{item.date}</span>}
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
                      <span className="text-2xl transform group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-xs text-gray-600 font-medium hidden sm:inline">{item.condition}</span>
                    </div>

                    <div className="text-xs font-semibold text-blue-600 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 mr-3">
                      💧 {item.rainChance}%
                    </div>

                    <div className="text-sm font-bold text-gray-900 w-20 sm:w-24 text-right">
                      <span>{item.tempMax}°</span>{' '}
                      <span className="text-gray-400 font-normal">/ {item.tempMin}°C</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {daily.map((item) => (
                  <div
                    key={item.day}
                    className="p-3.5 rounded-xl bg-white/60 hover:bg-white border border-white/50 hover:border-blue-200 shadow-sm hover:shadow transition-all flex flex-col items-center text-center group"
                  >
                    <span className="font-semibold text-xs text-gray-800">{item.day}</span>
                    {item.date && <span className="text-[10px] text-gray-400 mb-1">{item.date}</span>}
                    <span className="text-3xl my-2 transform group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-[11px] text-gray-500 truncate max-w-full mb-2">{item.condition}</span>
                    <div className="mt-auto w-full pt-2 border-t border-gray-100 flex flex-col gap-1 items-center">
                      <span className="text-[10px] font-semibold text-blue-600 px-1.5 py-0.5 rounded-full bg-blue-50">
                        💧 {item.rainChance}%
                      </span>
                      <span className="text-xs font-bold text-gray-900 mt-0.5">
                        {item.tempMax}° / <span className="text-gray-400 font-normal">{item.tempMin}°</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────
          TAB 2: "Metrics & Air Quality"
          Shows: AQI · UV · Wind Compass · Sunrise/Sunset · Quick Metrics
      ─────────────────────────────────────────────────── */}
      {activeTab === 'metrics' && (
        <div className="p-5 sm:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Weather Metrics & Air Quality</h3>
              <p className="text-xs text-gray-500 mt-0.5">Live environmental readings, AQI, UV advice & solar data</p>
            </div>
          </div>

          {/* 4 Rich Visual Widgets in responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Widget 1: AQI */}
            <div className="p-4 rounded-xl bg-white/80 hover:bg-white border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Air Quality Index</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${aqiConfig.color}`}>
                  {aqiConfig.status}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-gray-900">{aqiData.aqi}</span>
                <span className="text-xs font-medium text-gray-400">AQI</span>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-400 to-rose-500 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 right-0 bg-gray-200/60" style={{ width: `${Math.max(0, 100 - aqiConfig.percentage)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0 — Good</span>
                  <span>150+ — Unhealthy</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-[11px] text-gray-600">
                <span>PM2.5: <strong className="text-gray-900">{aqiData.pm25}</strong> µg/m³</span>
                <span>PM10: <strong className="text-gray-900">{aqiData.pm10}</strong> µg/m³</span>
              </div>
            </div>

            {/* Widget 2: UV Protection */}
            <div className="p-4 rounded-xl bg-white/80 hover:bg-white border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Sun className={`w-4 h-4 ${uvConfig.iconColor}`} />
                  <span>UV Protection</span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${uvConfig.badgeColor}`}>
                  UV {metrics.uvIndex} · {uvConfig.level}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-gray-900">{metrics.uvIndex}</span>
                <span className="text-xs font-medium text-gray-400">UV Index</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 font-medium leading-relaxed">{uvConfig.advice}</p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-[10px] text-gray-500">
                <span>Peak risk: 10 AM – 4 PM</span>
                <span className="text-amber-700 font-semibold">SPF recommended</span>
              </div>
            </div>

            {/* Widget 3: Wind Compass */}
            <div className="p-4 rounded-xl bg-white/80 hover:bg-white border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Wind className="w-4 h-4 text-teal-600" />
                  <span>Wind & Compass</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {windData.direction} · {windData.degrees}°
                </span>
              </div>

              <div className="flex items-center gap-4 mt-1">
                <div className="relative w-16 h-16 rounded-full border-2 border-teal-100 bg-teal-50/50 flex items-center justify-center shrink-0 shadow-inner">
                  <span className="absolute top-0.5 text-[9px] font-bold text-gray-400">N</span>
                  <span className="absolute bottom-0.5 text-[9px] font-bold text-gray-400">S</span>
                  <span className="absolute left-1 text-[9px] font-bold text-gray-400">W</span>
                  <span className="absolute right-1 text-[9px] font-bold text-gray-400">E</span>
                  <Navigation
                    className="w-6 h-6 text-teal-600 transition-transform duration-500"
                    style={{ transform: `rotate(${windData.degrees}deg)` }}
                  />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 block">{windData.speed}</span>
                  <span className="text-xs font-semibold text-teal-700">Gusts: {windData.gusts}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-[10px] text-gray-500">
                <span>Direction: {windData.direction}</span>
                <span>Moderate breeze</span>
              </div>
            </div>

            {/* Widget 4: Sunrise / Sunset */}
            <div className="p-4 rounded-xl bg-white/80 hover:bg-white border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  <span>Sun & Twilight Cycle</span>
                </div>
                {sunData.daylightDuration && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    ☀️ {sunData.daylightDuration}
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-1">
                <div className="w-full h-2 rounded-full bg-gradient-to-r from-amber-400 via-sky-300 to-indigo-500 shadow-inner" />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Dawn {sunData.dawn}</span>
                  <span>Dusk {sunData.dusk}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-amber-50/60 py-1.5 px-2 rounded-lg">
                  <Sunrise className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase block">Sunrise</span>
                    <strong className="text-xs text-gray-900">{sunData.sunrise}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-50/60 py-1.5 px-2 rounded-lg">
                  <Sunset className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase block">Sunset</span>
                    <strong className="text-xs text-gray-900">{sunData.sunset}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics strip — Feels Like, Humidity, Visibility, Pressure */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-white/80 hover:bg-white rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Feels Like</span>
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">{metrics.feelsLike}°C</p>
              <p className="text-[10px] text-gray-500">Similar to actual</p>
            </div>
            <div className="p-3 bg-white/80 hover:bg-white rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">{metrics.humidity}%</p>
              <p className="text-[10px] text-gray-500">Moderate moisture</p>
            </div>
            <div className="p-3 bg-white/80 hover:bg-white rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Visibility</span>
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-gray-900">{metrics.visibility}</p>
              <p className="text-[10px] text-gray-500">Clear sight lines</p>
            </div>
            <div className="p-3 bg-white/80 hover:bg-white rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pressure</span>
                <Gauge className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{metrics.pressure}</p>
              <p className="text-[10px] text-gray-500">Normal barometric</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Forecast;
