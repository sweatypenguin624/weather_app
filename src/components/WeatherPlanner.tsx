import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Shirt,
  Umbrella,
  Glasses,
  Backpack,
  Clock,
  CheckCircle2,
  X,
  Footprints,
  Bot,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  evaluateActivityWithAI,
  ActivityEvaluationResult,
} from '@/services/openRouterService';

export interface PlannerForecastHour {
  time: string;
  temp: number;
  condition: string;
  pop: number; // Probability of precipitation (0 - 100%)
  humidity: number;
  icon?: string;
  feelsLike?: number;
  windSpeed?: string;
  uvIndex?: number;
}

export interface ActivityRule {
  id: string;
  name: string;
  icon: string;
  idealWeather: string;
  evaluator: (hour: PlannerForecastHour) => number; // Returns score 0 - 100
  isCustom?: boolean;
}

export interface ThreeHourWindow {
  id: string;
  period: string; // e.g. "09:00 AM – 12:00 PM"
  label: string; // e.g. "Late Morning"
  avgTemp: number;
  maxPop: number;
  avgHumidity: number;
  condition: string;
  icon: string;
  suitabilityScore: number;
  ratingLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  badgeStyle: string;
  isBest?: boolean;
}

export interface OutfitItem {
  category: string;
  name: string;
  icon: React.ReactNode;
  badge: 'Essential' | 'Recommended' | 'Optional';
  badgeStyle: string;
  reason: string;
}

export interface WeatherPlannerProps {
  forecastData?: PlannerForecastHour[];
  currentTemp?: number;
  rainChance?: number;
  uvIndex?: number;
}

const defaultHourlyData: PlannerForecastHour[] = [
  { time: '12:00 AM', temp: 19, condition: 'Clear', pop: 0, humidity: 74, icon: '🌙' },
  { time: '01:00 AM', temp: 18, condition: 'Clear', pop: 0, humidity: 76, icon: '🌙' },
  { time: '02:00 AM', temp: 18, condition: 'Clear', pop: 0, humidity: 78, icon: '🌙' },
  { time: '03:00 AM', temp: 17, condition: 'Clear', pop: 5, humidity: 80, icon: '🌙' },
  { time: '04:00 AM', temp: 17, condition: 'Partly Cloudy', pop: 5, humidity: 82, icon: '☁️' },
  { time: '05:00 AM', temp: 18, condition: 'Partly Cloudy', pop: 10, humidity: 80, icon: '☁️' },
  { time: '06:00 AM', temp: 19, condition: 'Sunrise', pop: 10, humidity: 76, icon: '🌅' },
  { time: '07:00 AM', temp: 21, condition: 'Sunny', pop: 5, humidity: 70, icon: '☀️' },
  { time: '08:00 AM', temp: 23, condition: 'Sunny', pop: 5, humidity: 64, icon: '☀️' },
  { time: '09:00 AM', temp: 25, condition: 'Mostly Sunny', pop: 10, humidity: 58, icon: '🌤️' },
  { time: '10:00 AM', temp: 27, condition: 'Sunny', pop: 10, humidity: 52, icon: '☀️' },
  { time: '11:00 AM', temp: 29, condition: 'Partly Cloudy', pop: 15, humidity: 48, icon: '⛅' },
  { time: '12:00 PM', temp: 30, condition: 'Partly Cloudy', pop: 20, humidity: 44, icon: '⛅' },
  { time: '01:00 PM', temp: 31, condition: 'Passing Clouds', pop: 25, humidity: 42, icon: '⛅' },
  { time: '02:00 PM', temp: 31, condition: 'Scattered Showers', pop: 45, humidity: 50, icon: '🌦️' },
  { time: '03:00 PM', temp: 29, condition: 'Light Rain', pop: 60, humidity: 64, icon: '🌧️' },
  { time: '04:00 PM', temp: 28, condition: 'Overcast', pop: 40, humidity: 60, icon: '☁️' },
  { time: '05:00 PM', temp: 27, condition: 'Clearing Up', pop: 25, humidity: 56, icon: '🌤️' },
  { time: '06:00 PM', temp: 25, condition: 'Sunset', pop: 15, humidity: 60, icon: '🌇' },
  { time: '07:00 PM', temp: 24, condition: 'Clear Evening', pop: 10, humidity: 64, icon: '🌙' },
  { time: '08:00 PM', temp: 23, condition: 'Clear', pop: 5, humidity: 67, icon: '🌙' },
  { time: '09:00 PM', temp: 22, condition: 'Clear', pop: 5, humidity: 69, icon: '🌙' },
  { time: '10:00 PM', temp: 21, condition: 'Clear', pop: 0, humidity: 71, icon: '🌙' },
  { time: '11:00 PM', temp: 20, condition: 'Clear', pop: 0, humidity: 73, icon: '🌙' },
];

const presetActivities: ActivityRule[] = [
  {
    id: 'running',
    name: 'Outdoor Running',
    icon: '🏃‍♂️',
    idealWeather: 'Cool (18–24°C) & Dry',
    evaluator: (h) => {
      const tempScore = Math.max(0, 100 - Math.abs(h.temp - 21) * 6);
      const rainPenalty = h.pop * 1.5;
      const humidityPenalty = Math.max(0, h.humidity - 50) * 0.7;
      return Math.round(Math.max(10, Math.min(100, tempScore - rainPenalty - humidityPenalty + 20)));
    },
  },
  {
    id: 'cricket',
    name: 'Cricket Practice',
    icon: '🏏',
    idealWeather: 'Dry (<15% Rain) & Warm',
    evaluator: (h) => {
      const rainPenalty = h.pop * 2.2;
      const tempScore = h.temp >= 20 && h.temp <= 30 ? 60 : 30;
      return Math.round(Math.max(10, Math.min(100, tempScore + (40 - rainPenalty))));
    },
  },
  {
    id: 'laundry',
    name: 'Drying Laundry',
    icon: '🧺',
    idealWeather: 'Warm (>24°C) & Zero Rain',
    evaluator: (h) => {
      const rainPenalty = h.pop * 2.5;
      const tempBonus = (h.temp - 18) * 3;
      const humidityPenalty = (h.humidity - 35) * 0.8;
      return Math.round(Math.max(5, Math.min(100, 60 + tempBonus - rainPenalty - humidityPenalty)));
    },
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    icon: '🚗',
    idealWeather: 'Zero Rain (<10%) & Moderate Sun',
    evaluator: (h) => {
      const rainPenalty = h.pop * 3.0; // heavy rain penalty
      const tempScore = Math.max(0, 40 - Math.abs(h.temp - 23));
      return Math.round(Math.max(5, Math.min(100, 60 + tempScore - rainPenalty)));
    },
  },
  {
    id: 'cycling',
    name: 'Cycling & Commute',
    icon: '🚲',
    idealWeather: 'Mild (19–26°C) & Clear Skies',
    evaluator: (h) => {
      const rainPenalty = h.pop * 1.8;
      const tempScore = Math.max(0, 60 - Math.abs(h.temp - 22) * 5);
      return Math.round(Math.max(10, Math.min(100, tempScore + 40 - rainPenalty)));
    },
  },
  {
    id: 'study',
    name: 'Outdoor Study / Work',
    icon: '📚',
    idealWeather: 'Comfortable (20–26°C) & Peaceful',
    evaluator: (h) => {
      const tempScore = Math.max(0, 70 - Math.abs(h.temp - 23) * 6);
      const rainPenalty = h.pop * 1.6;
      return Math.round(Math.max(10, Math.min(100, tempScore + 30 - rainPenalty)));
    },
  },
];

export const WeatherPlanner: React.FC<WeatherPlannerProps> = ({
  forecastData = defaultHourlyData,
  currentTemp = 28,
  rainChance = 45,
  uvIndex = 6,
}) => {
  const [activities, setActivities] = useState<ActivityRule[]>(presetActivities);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRule>(presetActivities[0]);
  const [customInput, setCustomInput] = useState('');

  const [aiEvaluation, setAiEvaluation] = useState<ActivityEvaluationResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const runAiEvaluation = useCallback(async (activityName: string) => {
    setIsLoadingAi(true);
    try {
      const result = await evaluateActivityWithAI(
        activityName,
        forecastData.map((h) => ({
          time: h.time,
          temp: h.temp,
          pop: h.pop,
          condition: h.condition,
        }))
      );
      setAiEvaluation(result);
    } catch (err) {
      console.warn('AI activity evaluation error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  }, [forecastData]);

  // Run AI evaluation on activity change
  useEffect(() => {
    runAiEvaluation(selectedActivity.name);
  }, [selectedActivity.name, runAiEvaluation]);

  // Handle adding a custom activity
  const handleAddCustomActivity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    // Intelligent heuristic evaluator based on activity keywords
    const lower = trimmed.toLowerCase();
    let idealText = 'Dry & Pleasant Temperature';
    let iconChar = '✨';

    if (lower.includes('cricket') || lower.includes('football') || lower.includes('sport') || lower.includes('match') || lower.includes('game')) {
      iconChar = '🏏';
      idealText = 'Dry (<15% Rain) & Good Visibility';
    } else if (lower.includes('wash') || lower.includes('clean') || lower.includes('car')) {
      iconChar = '🚗';
      idealText = 'Zero Rain Expected & Mild Sun';
    } else if (lower.includes('blanket') || lower.includes('dry') || lower.includes('laundry')) {
      iconChar = '🧺';
      idealText = 'Warm, Low Humidity & Sunny';
    } else if (lower.includes('bike') || lower.includes('cycle') || lower.includes('ride')) {
      iconChar = '🚲';
      idealText = 'Cool & Dry Roads';
    } else if (lower.includes('walk') || lower.includes('run') || lower.includes('jog')) {
      iconChar = '🏃‍♂️';
      idealText = 'Cool Breeze (<24°C) & Clear';
    } else if (lower.includes('picnic') || lower.includes('park') || lower.includes('hike') || lower.includes('travel')) {
      iconChar = '🏕️';
      idealText = 'Clear Skies & Moderate Warmth';
    }

    const newRule: ActivityRule = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      icon: iconChar,
      idealWeather: idealText,
      isCustom: true,
      evaluator: (h) => {
        const rainPenalty = h.pop * 2.0;
        const tempScore = Math.max(0, 60 - Math.abs(h.temp - 24) * 4);
        return Math.round(Math.max(10, Math.min(100, 40 + tempScore - rainPenalty)));
      },
    };

    setActivities((prev) => [newRule, ...prev]);
    setSelectedActivity(newRule);
    setCustomInput('');
  };

  const handleRemoveActivity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (selectedActivity.id === id) {
      setSelectedActivity(activities.find((a) => a.id !== id) || presetActivities[0]);
    }
  };

  // Rank full hourly forecast to find optimal recommended time slot
  const rankedHours = useMemo(() => {
    return [...forecastData].sort((a, b) => {
      const scoreB = selectedActivity.evaluator(b);
      const scoreA = selectedActivity.evaluator(a);
      return scoreB - scoreA;
    });
  }, [forecastData, selectedActivity]);

  const bestSlot = rankedHours[0] || forecastData[0];
  const bestSlotScore = selectedActivity.evaluator(bestSlot);

  // Group forecast into 6 active 3-hour windows (06:00 AM - 12:00 AM)
  const threeHourWindows = useMemo((): ThreeHourWindow[] => {
    const windowDefinitions = [
      { id: 'w1', period: '06:00 AM – 09:00 AM', label: 'Early Morning', start: 6, end: 9 },
      { id: 'w2', period: '09:00 AM – 12:00 PM', label: 'Late Morning', start: 9, end: 12 },
      { id: 'w3', period: '12:00 PM – 03:00 PM', label: 'Afternoon', start: 12, end: 15 },
      { id: 'w4', period: '03:00 PM – 06:00 PM', label: 'Late Afternoon', start: 15, end: 18 },
      { id: 'w5', period: '06:00 PM – 09:00 PM', label: 'Evening', start: 18, end: 21 },
      { id: 'w6', period: '09:00 PM – 12:00 AM', label: 'Night', start: 21, end: 24 },
    ];

    const results = windowDefinitions.map((def) => {
      const hoursInWindow = forecastData.slice(def.start, def.end);
      const safeHours = hoursInWindow.length > 0 ? hoursInWindow : [forecastData[0]];

      const avgTemp = Math.round(
        safeHours.reduce((acc, curr) => acc + curr.temp, 0) / safeHours.length
      );
      const maxPop = Math.max(...safeHours.map((h) => h.pop));
      const avgHumidity = Math.round(
        safeHours.reduce((acc, curr) => acc + curr.humidity, 0) / safeHours.length
      );

      // Score the window based on selected activity evaluator
      const avgScore = Math.round(
        safeHours.reduce((acc, curr) => acc + selectedActivity.evaluator(curr), 0) /
          safeHours.length
      );

      const representative = safeHours[Math.floor(safeHours.length / 2)] || safeHours[0];

      let ratingLabel: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
      let badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';

      if (avgScore >= 80) {
        ratingLabel = 'Excellent';
        badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (avgScore >= 65) {
        ratingLabel = 'Good';
        badgeStyle = 'bg-blue-100 text-blue-800 border-blue-300';
      } else if (avgScore < 45) {
        ratingLabel = 'Poor';
        badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
      }

      return {
        id: def.id,
        period: def.period,
        label: def.label,
        avgTemp,
        maxPop,
        avgHumidity,
        condition: representative.condition,
        icon: representative.icon || '⛅',
        suitabilityScore: avgScore,
        ratingLabel,
        badgeStyle,
      };
    });

    // Mark the highest scoring window as the Best Window
    let bestWindowId = results[0]?.id;
    let maxWindowScore = -1;
    results.forEach((w) => {
      if (w.suitabilityScore > maxWindowScore) {
        maxWindowScore = w.suitabilityScore;
        bestWindowId = w.id;
      }
    });

    return results.map((w) => ({
      ...w,
      isBest: w.id === bestWindowId,
    }));
  }, [forecastData, selectedActivity]);

  // Dynamic Outfit & Gear Recommendations based on weather metrics
  const outfitRecommendations = useMemo((): OutfitItem[] => {
    const items: OutfitItem[] = [];

    // 1. Top recommendation
    if (currentTemp >= 27) {
      items.push({
        category: 'Top',
        name: 'Light Cotton T-Shirt or Linen Shirt',
        icon: <Shirt className="w-4 h-4 text-amber-600" />,
        badge: 'Essential',
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        reason: `Warm conditions (${currentTemp}°C) • Breathable, lightweight fabric keeps you cool.`,
      });
    } else if (currentTemp >= 20) {
      items.push({
        category: 'Top',
        name: 'Comfortable T-Shirt with Light Overshirt',
        icon: <Shirt className="w-4 h-4 text-blue-600" />,
        badge: 'Essential',
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        reason: `Pleasant ${currentTemp}°C temperature • Adaptable layering for changing conditions.`,
      });
    } else {
      items.push({
        category: 'Top',
        name: 'Warm Sweatshirt or Knit Pullover',
        icon: <Shirt className="w-4 h-4 text-indigo-600" />,
        badge: 'Essential',
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        reason: `Cooler air (${currentTemp}°C) • Thermal insulation recommended.`,
      });
    }

    // 2. Bottom recommendation
    if (currentTemp >= 25) {
      items.push({
        category: 'Bottom',
        name: 'Breathable Shorts or Lightweight Chinos',
        icon: <Footprints className="w-4 h-4 text-teal-600" />,
        badge: 'Recommended',
        badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
        reason: 'Loose fit promotes airflow during daytime warmth.',
      });
    } else {
      items.push({
        category: 'Bottom',
        name: 'Comfortable Trousers or Denim Jeans',
        icon: <Footprints className="w-4 h-4 text-teal-600" />,
        badge: 'Recommended',
        badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
        reason: 'Optimal coverage for mild outdoor breeze.',
      });
    }

    // 3. Rain Gear / Umbrella
    if (rainChance >= 30) {
      items.push({
        category: 'Rain Gear',
        name: 'Windproof Compact Umbrella',
        icon: <Umbrella className="w-4 h-4 text-blue-500" />,
        badge: 'Essential',
        badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
        reason: `💧 ${rainChance}% precipitation risk • Keep handy for passing showers.`,
      });
    } else {
      items.push({
        category: 'Rain Gear',
        name: 'Light Water-Resistant Shell',
        icon: <Umbrella className="w-4 h-4 text-slate-500" />,
        badge: 'Optional',
        badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200',
        reason: `Low rain probability (${rainChance}%) • Minimal precipitation threat.`,
      });
    }

    // 4. Sun & Eye Protection
    if (uvIndex >= 5) {
      items.push({
        category: 'Sun Protection',
        name: 'UV400 Sunglasses & SPF 30+ Sunscreen',
        icon: <Glasses className="w-4 h-4 text-amber-500" />,
        badge: 'Essential',
        badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
        reason: `High UV level (${uvIndex}) • Protect eyes & skin during peak daytime hours.`,
      });
    } else {
      items.push({
        category: 'Sun Protection',
        name: 'Polarized Sunglasses or Sun Cap',
        icon: <Glasses className="w-4 h-4 text-sky-500" />,
        badge: 'Optional',
        badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200',
        reason: `Moderate UV (${uvIndex}) • Beneficial when exposed to direct sunlight.`,
      });
    }

    // 5. Gear & Bag
    items.push({
      category: 'Gear',
      name: 'Water-Repellent Everyday Backpack',
      icon: <Backpack className="w-4 h-4 text-indigo-500" />,
      badge: 'Recommended',
      badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      reason: 'Safeguard electronics, umbrella, and sunglasses on the go.',
    });

    return items;
  }, [currentTemp, rainChance, uvIndex]);

  return (
    <section className="w-full max-w-7xl mx-auto p-5 sm:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Smart Day Planner
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Activity optimizer & outfit recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/60 self-start sm:self-auto">
          <span>Target Conditions:</span>
          <strong className="text-blue-700">{selectedActivity.idealWeather}</strong>
        </div>
      </div>

      {/* Custom Activity Input Bar & Preset Activity Hub */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <form
            onSubmit={handleAddCustomActivity}
            className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-200/90 px-3 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all"
          >
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type any custom activity (e.g., Cricket Practice, Car Wash, Drying Blanket)..."
              className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 transition-all active:scale-95 shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan Task</span>
            </button>
          </form>
        </div>

        {/* Preset & Custom Activity Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {activities.map((act) => {
            const isSelected = selectedActivity.id === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedActivity(act)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border group cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                    : 'bg-white/80 text-gray-700 border-gray-200/80 hover:bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <span className="text-base">{act.icon}</span>
                <span className="truncate">{act.name}</span>
                {act.isCustom && (
                  <span
                    onClick={(e) => handleRemoveActivity(act.id, e)}
                    className="ml-1 p-0.5 rounded-full hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                    title="Remove custom task"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Responsive Dashboard: Optimal Window + 3-Hour Breakdown vs Outfit Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Optimal Recommended Slot + 3-Hour Suitability Grid (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Optimal Recommended Time Slot Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl border border-blue-500/30 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedActivity.icon}</span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                    Optimal Recommended Window for {selectedActivity.name}
                  </span>
                  <p className="text-xs text-blue-100">
                    Calculated using multi-variable hourly forecast score
                  </p>
                </div>
              </div>
              <span className="text-xs bg-white/20 backdrop-blur-md text-white font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                {bestSlotScore}% Suitability
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-3">
              <span className="text-3xl font-extrabold tracking-tight">{bestSlot.time}</span>
              <span className="text-base font-medium text-blue-100">
                ({bestSlot.temp}°C • {bestSlot.condition})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-xs text-blue-100">
              <div className="flex items-center gap-1">
                <span>💧</span>
                <span>Rain: {bestSlot.pop}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💨</span>
                <span>Humidity: {bestSlot.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🎯</span>
                <span>{selectedActivity.idealWeather}</span>
              </div>
            </div>
          </div>

          {/* AI Custom Activity Evaluator Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-blue-50/80 rounded-2xl border border-indigo-100/90 shadow-sm hover:shadow-md transition-all duration-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                      AI Activity Evaluator
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Deep multi-factor analysis for &quot;{selectedActivity.name}&quot;
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runAiEvaluation(selectedActivity.name)}
                disabled={isLoadingAi}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Re-run AI Activity Evaluation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden sm:inline">AI Analyze</span>
              </button>
            </div>

            {isLoadingAi ? (
              <div className="py-3 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating meteorological vectors for &quot;{selectedActivity.name}&quot;...</span>
                </div>
                <div className="h-3.5 bg-indigo-200/50 rounded-full w-full" />
                <div className="h-3.5 bg-indigo-200/30 rounded-full w-4/5" />
              </div>
            ) : aiEvaluation ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-100/80">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selectedActivity.icon}</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Best AI Recommended Window
                      </span>
                      <strong className="text-xs sm:text-sm text-indigo-900 font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {aiEvaluation.bestTimeSlot}
                      </strong>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                      aiEvaluation.suitabilityScore >= 80
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : aiEvaluation.suitabilityScore >= 65
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {aiEvaluation.suitabilityScore}% • {aiEvaluation.rating}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed font-medium bg-white/50 p-2.5 rounded-xl border border-indigo-50">
                  {aiEvaluation.reasoning}
                </p>

                {aiEvaluation.safetyTips && aiEvaluation.safetyTips.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Safety & Preparation Tips:
                    </span>
                    <ul className="space-y-1">
                      {aiEvaluation.safetyTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* 3-Hour Suitability Score Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>3-Hour Suitability Score Breakdown</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Daytime & evening progression
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {threeHourWindows.map((win) => (
                <div
                  key={win.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative ${
                    win.isBest
                      ? 'bg-blue-50/90 border-blue-400 shadow-md ring-2 ring-blue-300'
                      : 'bg-white/80 hover:bg-white border-white/40 hover:border-blue-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {win.isBest && (
                    <span className="absolute -top-2.5 right-2 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                      ⭐ Best Window
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{win.label}</span>
                      <span className="text-base">{win.icon}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 block font-medium">
                      {win.period}
                    </span>
                  </div>

                  <div className="my-2 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-gray-900">{win.avgTemp}°C</span>
                    <span className="text-[11px] font-medium text-blue-600">
                      💧 {win.maxPop}% rain
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="mt-1">
                    <span
                      className={`inline-block w-full text-center py-1 px-2 rounded-lg text-xs font-bold border ${win.badgeStyle}`}
                    >
                      {win.suitabilityScore}% • {win.ratingLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Outfit & Gear Recommendations (5 Cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Shirt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    What to Wear & Bring Today
                  </h3>
                  <p className="text-xs text-gray-500">
                    Dynamic wardrobe guidance for current forecast
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                {currentTemp}°C • {rainChance}% Rain
              </span>
            </div>

            {/* List of Outfit Items */}
            <div className="space-y-2.5">
              {outfitRecommendations.map((item, idx) => (
                <div
                  key={`${item.category}-${idx}`}
                  className="p-3 rounded-xl bg-white/80 hover:bg-white border border-white/40 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeStyle}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">
                      {item.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Comfort Indicator Strip */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/80 rounded-xl border border-blue-100/70 flex items-center justify-between text-xs text-gray-700">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Prep Level: <strong>All-Weather Ready</strong></span>
            </div>
            <span className="text-indigo-600 font-bold">Auto-Updates Hourly</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherPlanner;
