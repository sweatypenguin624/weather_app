
export interface WeatherTheme {
  background: string;
  pageBackground: string; // Added for main page background
  text: string;
  card: string;
  accent: string;
}

export const getWeatherTheme = (
  condition: string
): WeatherTheme => {
  const weather = condition.toLowerCase();

  // Stormy weather
  if (weather.includes("thunder") || weather.includes("storm")) {
    return {
      background:
        "bg-gradient-to-br from-slate-200 via-blue-200 to-gray-200",
      pageBackground:
       "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100",
      text: "text-slate-800",
      card: "bg-white/60 border-white/70 hover:bg-white/75",
      accent: "text-slate-600",
    };
  }

  // Rainy weather
  if (
    weather.includes("rain") ||
    weather.includes("drizzle") ||
    weather.includes("shower")
  ) {
    return {
      background:
        "bg-gradient-to-br from-blue-100 via-slate-100 to-blue-200",
      pageBackground:
       "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100",
      text: "text-slate-800",
      card: "bg-white/65 border-white/70 hover:bg-white/80",
      accent: "text-slate-600",
    };
  }

  // Snowy weather
  if (
    weather.includes("snow") ||
    weather.includes("ice") ||
    weather.includes("frost")
  ) {
    return {
      background:
        "bg-gradient-to-br from-white via-sky-50 to-blue-100",
      pageBackground:
       "bg-gradient-to-br from-white via-sky-50 to-blue-50",
      text: "text-slate-800",
      card: "bg-white/70 border-white/80 hover:bg-white/85",
      accent: "text-sky-600",
    };
  }

  // Foggy weather
  if (
    weather.includes("fog") ||
    weather.includes("mist") ||
    weather.includes("haze")
  ) {
    return {
      background:
        "bg-gradient-to-br from-gray-100 via-slate-100 to-blue-100",
      pageBackground:
       "bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50",
      text: "text-slate-800",
      card: "bg-white/65 border-white/70 hover:bg-white/80",
      accent: "text-slate-600",
    };
  }

  // Cloudy weather
  if (
    weather.includes("cloud") ||
    weather.includes("overcast")
  ) {
    return {
      background:
        "bg-gradient-to-br from-slate-100 via-blue-100 to-sky-200",
      pageBackground:
       "bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100",
      text: "text-slate-800",
      card: "bg-white/65 border-white/70 hover:bg-white/80",
      accent: "text-slate-600",
    };
  }

  // Sunny or clear weather
  if (
    weather.includes("clear") ||
    weather.includes("sun")
  ) {
    return {
      background:"bg-gradient-to-br from-sky-100 via-yellow-50 to-amber-100",
      pageBackground:   "bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50",
      text: "text-slate-800",
      card: "bg-white/65 border-white/70 hover:bg-white/80",
      accent: "text-amber-600",
    };
  }

  // Default weather
  return {
    background:
      "bg-gradient-to-br from-sky-100 via-white to-blue-100",
    pageBackground:
      "bg-gradient-to-br from-slate-50 via-white to-sky-50",
    text: "text-slate-800",
    card: "bg-white/65 border-white/70 hover:bg-white/80",
    accent: "text-slate-600",
  };
};
