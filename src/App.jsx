
import React, { useState } from "react";
import WeatherChatBot from "./components/WeatherChatBot";

export function App() {
  const [theme, setTheme] = useState("sunny");

  const getThemeStyle = (currentTheme) => {
    switch (currentTheme) {
      case "rainy":
        return {
          background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
          color: "#f8fafc"
        };

      case "cloudy":
        return {
          background: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
          color: "#f8fafc"
        };

      case "snowy":
        return {
          background: "linear-gradient(135deg, #bae6fd 0%, #475569 100%)",
          color: "#ffffff"
        };

      case "sunny":
      default:
        return {
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
          color: "#ffffff"
        };
    }
  };

  const currentStyle = getThemeStyle(theme);

  return (
    <div
      style={{
        minHeight: "100vh",
        ...currentStyle,
        transition: "background 0.8s ease-in-out",
        padding: "40px 20px",
        boxSizing: "border-box"
      }}
    >
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: 800,
          margin: "0 0 10px 0"
        }}>
          Interactive Weather App 🌤️
        </h1>

        <p style={{ fontSize: "1.1rem", marginBottom: "40px" }}>
          Current Theme Mode:{" "}
          <strong style={{ textTransform: "uppercase" }}>
            {theme}
          </strong>
        </p>

        <div style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "40px",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}>
          <h2>Welcome to your Feature Branch!</h2>
          <p>
            Try asking SkyBot: "What's the weather in Bengaluru?"
          </p>
        </div>
      </div>

      <WeatherChatBot
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />
    </div>
  );
}

export default App;
