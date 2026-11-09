
import React, { useState, useRef, useEffect } from "react";
import {
  Send, CloudSun, Sun, Cloud, CloudRain,
  Snowflake, Wind, Droplets, MapPin, Bot
} from "lucide-react";
import "./WeatherChatBot.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function getTheme(weather) {
  const condition = weather.toLowerCase();

  if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunder"))
    return "rainy";

  if (condition.includes("cloud"))
    return "cloudy";

  if (condition.includes("snow"))
    return "snowy";

  if (condition.includes("clear"))
    return "sunny";

  return "default";
}

function getWeatherIcon(weather) {
  const condition = weather.toLowerCase();

  if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("thunder"))
    return <CloudRain size={32} />;

  if (condition.includes("cloud"))
    return <Cloud size={32} />;

  if (condition.includes("snow"))
    return <Snowflake size={32} />;

  if (condition.includes("clear"))
    return <Sun size={32} />;

  return <CloudSun size={32} />;
}

export default function WeatherChatBot({ onThemeChange }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! 👋 I'm SkyBot, your personal weather assistant. Ask me about the weather in any city!",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function addMessage(sender, text) {
    setMessages(prev => [
      ...prev,
      {
        sender,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }
    ]);
  }

  async function fetchWeather(city) {
    if (!API_KEY) {
      throw new Error("Weather API key is missing. Please configure your .env file.");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message === "city not found"
          ? "I couldn't find that city. Please check its spelling."
          : data.message || "Unable to fetch weather."
      );
    }

    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: data.wind.speed,
      description: data.weather[0].description,
      condition: data.weather[0].main
    };
  }

  function extractCity(message) {
    const match = message.match(
      /(?:weather|temperature|forecast|climate)\s+(?:in|at|for)\s+(.+?)[?.!]*$/i
    );

    if (match) return match[1].trim();

    const simpleMatch = message.match(
      /^(?:weather\s+)?([a-zA-Z][a-zA-Z\s-]+)\s*[?.!]*$/i
    );

    if (simpleMatch) {
      const possibleCity = simpleMatch[1].trim();
      if (
        !["hello", "hi", "hey", "thanks", "thank you"].includes(
          possibleCity.toLowerCase()
        )
      ) return possibleCity;
    }

    return null;
  }

  async function handleSend(text = input) {
    const query = text.trim();

    if (!query || loading) return;

    addMessage("user", query);
    setInput("");

    const city = extractCity(query);

    if (!city) {
      addMessage(
        "bot",
        "I can help with live weather! 🌍 Try asking: 'What's the weather in Bengaluru?'"
      );
      return;
    }

    setLoading(true);

    try {
      const result = await fetchWeather(city);

      setWeather(result);

      const newTheme = getTheme(result.condition);

      if (onThemeChange) {
        onThemeChange(newTheme);
      }

      let advice = "";

      if (result.condition.toLowerCase().includes("rain")) {
        advice = "🌂 Don't forget your umbrella!";
      } else if (result.temperature >= 32) {
        advice = "☀️ It's quite hot! Stay hydrated and avoid prolonged sun exposure.";
      } else if (result.temperature <= 18) {
        advice = "🧥 It's chilly! You might want to carry a jacket.";
      } else {
        advice = "✨ Looks like a pleasant day. Enjoy your time outside!";
      }

      addMessage(
        "bot",
        `📍 ${result.city}, ${result.country}\n\n` +
        `${result.description}\n\n` +
        `🌡️ Temperature: ${result.temperature}°C\n` +
        `Feels like: ${result.feelsLike}°C\n` +
        `💧 Humidity: ${result.humidity}%\n` +
        `💨 Wind speed: ${result.wind} m/s\n\n` +
        advice
      );

    } catch (error) {
      addMessage("bot", `⚠️ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`weather-chatbot theme-${weather ? getTheme(weather.condition) : "default"}`}>

      <div className="chatbot-header">
        <div className="chatbot-avatar">
          <CloudSun size={30} />
        </div>

        <div>
          <h2>SkyBot</h2>
          <p><span className="online-dot"></span> Your AI Weather Assistant</p>
        </div>

        <span className="chatbot-status">LIVE WEATHER</span>
      </div>

      {weather && (
        <div className="weather-summary">
          {getWeatherIcon(weather.condition)}

          <div className="weather-location">
            <h3>{weather.city}</h3>
            <p>{weather.description}</p>
          </div>

          <div className="weather-temperature">
            {weather.temperature}°
          </div>

          <div className="weather-details">
            <span><Droplets size={15} /> {weather.humidity}%</span>
            <span><Wind size={15} /> {weather.wind} m/s</span>
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message-row ${message.sender}`}>

            {message.sender === "bot" && (
              <div className="bot-icon"><Bot size={18} /></div>
            )}

            <div className="message-content">
              <div className="message-bubble">
                {message.text}
              </div>
              <span className="message-time">{message.time}</span>
            </div>

          </div>
        ))}

        {loading && (
          <div className="message-row bot">
            <div className="bot-icon"><Bot size={18} /></div>
            <div className="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="quick-suggestions">
        <button onClick={() => handleSend("Weather in Bengaluru")}>
          📍 Bengaluru
        </button>

        <button onClick={() => handleSend("Weather in Mumbai")}>
          🌊 Mumbai
        </button>

        <button onClick={() => handleSend("Weather in Delhi")}>
          ☀️ Delhi
        </button>
      </div>

      <form
        className="chat-input-area"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about the weather in any city..."
        />

        <button type="submit" disabled={loading || !input.trim()}>
          <Send size={20} />
        </button>
      </form>

      <p className="chatbot-footer">
        Powered by OpenWeatherMap · SkyBot
      </p>

    </div>
  );
}

  