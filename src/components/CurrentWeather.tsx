
import { useState } from "react";

import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  Snowflake,
  Droplets,
  Wind,
  MapPin,
  Thermometer,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { getWeatherTheme } from "./WeatherTheme";
import type { WeatherData } from "../data/WeatherData";

interface CurrentWeatherProps {
  weather: WeatherData;
}

// Select icon according to weather condition

const getWeatherIcon = (condition: string): LucideIcon => {
  const weather = condition.toLowerCase();

  if (weather.includes("thunder") || weather.includes("storm")) {
    return CloudLightning;
  }

  if (
    weather.includes("rain") ||
    weather.includes("drizzle") ||
    weather.includes("shower")
  ) {
    return CloudRain;
  }

  if (weather.includes("snow")) {
    return Snowflake;
  }

  if (
    weather.includes("fog") ||
    weather.includes("mist") ||
    weather.includes("haze")
  ) {
    return Cloud;
  }

  if (weather.includes("partly cloudy")) {
    return CloudSun;
  }

  if (weather.includes("cloud") || weather.includes("overcast")) {
    return Cloud;
  }

  if (weather.includes("clear") || weather.includes("sun")) {
    return Sun;
  }

  return CloudSun;
};


// Main weather component
const CurrentWeather = ({ weather }: CurrentWeatherProps) => {
  // Selected temperature unit
  const [unit, setUnit] = useState<"C" | "F">("C");

  // Weather-based colors
  const theme = getWeatherTheme(weather.condition);

  // Weather icon
 const WeatherIcon = getWeatherIcon(weather.condition);

  // Convert temperature
  const convertTemp = (temp: number) => {
    return unit === "C"
      ? Math.round(temp)
      : Math.round((temp * 9) / 5 + 32);
  };

  return (

<section
  className={`
    relative
    isolate
    overflow-hidden
    w-full
    rounded-[2rem]
    p-5
    sm:p-8
    lg:p-10
    ${theme.background}
    ${theme.text}
    border
    border-white/30
    shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)]
    backdrop-blur-2xl
    transition-all
    duration-700
    ease-out
  `}
>

      {/* Natural background decoration */}

      <div
        className="
          pointer-events-none
          absolute
          -top-20
          -right-20
          w-64
          h-64
          rounded-full
          blur-3xl
          animate-[weatherFloat_8s_ease-in-out_infinite]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-20
          w-72
          h-72
          rounded-full
          blur-3xl
          animate-[weatherFloat_10s_ease-in-out_infinite]
        "
      />

      {/* Weather content */}

      <div className="relative z-10">

        {/* City and temperature unit */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            pb-6
            border-b
            border-white/30
          "
        >
          <div className="flex items-center gap-2.5 min-w-0">

            <MapPin
              size={22}
              className="shrink-0 opacity-80"
            />

            <h2
              className="
                text-lg
                sm:text-2xl
                font-semibold
                tracking-wide
                truncate
              "
            >
              {weather.city}
            </h2>

          </div>

          {/* Celsius and Fahrenheit */}

          <div
            className="
              flex
              shrink-0
              items-center
              rounded-full
              bg-black/10
              backdrop-blur-md
              p-1
              shadow-inner
            "
          >

            <button
              onClick={() => setUnit("C")}
              className={`
                rounded-full
                px-3
                sm:px-4
                py-1.5
                text-sm
                transition-all
                duration-300
                active:scale-95

                ${
                  unit === "C"
                    ? "bg-white text-gray-900 shadow-md font-semibold"
                    : "opacity-70 hover:opacity-100"
                }
              `}
            >
              °C
            </button>

            <button
              onClick={() => setUnit("F")}
              className={`
                rounded-full
                px-3
                sm:px-4
                py-1.5
                text-sm
                transition-all
                duration-300
                active:scale-95

                ${
                  unit === "F"
                    ? "bg-white text-gray-900 shadow-md font-semibold"
                    : "opacity-70 hover:opacity-100"
                }
              `}
            >
              °F
            </button>

          </div>
        </div>

        {/* Main weather information */}

        <div
          className="
            my-10
            sm:my-14
            flex
            flex-col
            items-center
            text-center
          "
        >

          {/* Weather icon */}

          <div
            className="
              mb-5
              animate-[weatherFloat_5s_ease-in-out_infinite]
            "
          >
            <WeatherIcon
              size={100}
              strokeWidth={1.3}
              className="drop-shadow-md sm:w-[120px] sm:h-[120px]"
            />
          </div>

          {/* Temperature */}

          <h1
            className="
              text-7xl
              sm:text-8xl
              font-extralight
              tracking-tighter
              leading-none
            "
          >
            {convertTemp(weather.temperature)}°
          </h1>

          {/* Weather condition */}

          <p
            className="
              mt-5
              text-2xl
              sm:text-3xl
              font-medium
            "
          >
            {weather.condition}
          </p>

          <p
            className="
              mt-2
              text-base
              sm:text-lg
              opacity-75
              capitalize
            "
          >
            {weather.description}
          </p>

          {/* Feels like */}

          <div
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-full
              px-5
              py-2
              bg-white/20
              backdrop-blur-sm
              border
              border-white/20
              shadow-sm
            "
          >
            <Thermometer size={17} />

            <span className="text-sm font-medium">
              Feels like {convertTemp(weather.feelsLike)}°
            </span>

          </div>

        </div>

        {/* Weather details */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:gap-5
            pt-4
          "
        >

          {/* Minimum temperature */}

          <div
            className={`
              ${theme.card}
              rounded-2xl
              p-4
              sm:p-6
              border
              border-white/30
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
            `}
          >
            <Thermometer
              size={24}
              className={theme.accent}
            />

            <p
              className="
                mt-4
                text-xs
                uppercase
                tracking-wider
                font-medium
                opacity-70
              "
            >
              Min Temp
            </p>

            <p className="mt-1 text-2xl sm:text-3xl font-bold">
              {convertTemp(weather.tempMin)}°
            </p>

          </div>

          {/* Maximum temperature */}

          <div
            className={`
              ${theme.card}
              rounded-2xl
              p-4
              sm:p-6
              border
              border-white/30
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
            `}
          >
            <Thermometer
              size={24}
              className={theme.accent}
            />

            <p
              className="
                mt-4
                text-xs
                uppercase
                tracking-wider
                font-medium
                opacity-70
              "
            >
              Max Temp
            </p>

            <p className="mt-1 text-2xl sm:text-3xl font-bold">
              {convertTemp(weather.tempMax)}°
            </p>

          </div>

          {/* Humidity */}

          <div
            className={`
              ${theme.card}
              rounded-2xl
              p-4
              sm:p-6
              border
              border-white/30
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
            `}
          >
            <Droplets
              size={24}
              className={theme.accent}
            />

            <p
              className="
                mt-4
                text-xs
                uppercase
                tracking-wider
                font-medium
                opacity-70
              "
            >
              Humidity
            </p>

            <p className="mt-1 text-2xl sm:text-3xl font-bold">
              {weather.humidity}%
            </p>

          </div>

          {/* Wind speed */}

          <div
            className={`
              ${theme.card}
              rounded-2xl
              p-4
              sm:p-6
              border
              border-white/30
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
            `}
          >
            <Wind
              size={24}
              className={theme.accent}
            />

            <p
              className="
                mt-4
                text-xs
                uppercase
                tracking-wider
                font-medium
                opacity-70
              "
            >
              Wind Speed
            </p>

            <p className="mt-1 text-2xl sm:text-3xl font-bold">
              {weather.windSpeed}

              <span className="text-sm font-normal opacity-75">
                {" "}km/h
              </span>
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default CurrentWeather;
