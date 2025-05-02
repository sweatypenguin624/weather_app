# 🌤️ Weather App

A sleek and responsive weather application that provides real-time weather updates for any city worldwide. Built with modern web technologies, this app offers users an intuitive interface to check current weather conditions effortlessly.

## 🚀 Live Demo

Experience the live application here: [penguinweather2.vercel.app](https://penguinweather2.vercel.app)

## 🛠️ Features

- **Real-Time Weather Data**: Fetches up-to-date weather information using the OpenWeatherMap API.
- **City Search**: Users can search for any city to get current weather details.
- **Responsive Design**: Optimized for various devices, ensuring a seamless experience on desktops, tablets, and mobile phones.
- **Clean UI**: Minimalistic design with a focus on user experience.

## 🧰 Tech Stack

- **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Package Manager**: [bun](https://bun.sh/)
- **API**: [OpenWeatherMap API](https://openweathermap.org/api)

## 📁 Project Structure

```
weather_app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.ts
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## 🧑‍💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [bun](https://bun.sh/) installed globally

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sweatypenguin624/weather_app.git
   cd weather_app
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Run the development server:**

   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:3000`.

## 🔧 Configuration

To fetch weather data, you'll need an API key from OpenWeatherMap:

1. **Obtain an API Key:**

   Sign up at [OpenWeatherMap](https://openweathermap.org/api) and get your API key.

2. **Set up Environment Variables:**

   Create a `.env` file in the root directory and add your API key:

   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

   Replace `your_api_key_here` with your actual API key.

## 📦 Deployment

The application is ready for deployment on platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

**Deploy on Vercel:**

1. **Install Vercel CLI (if not already installed):**

   ```bash
   npm install -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

   Follow the prompts to complete the deployment.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
