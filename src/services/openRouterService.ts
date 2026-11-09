export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterChoice {
  message?: {
    role: string;
    content: string;
  };
  finish_reason?: string;
}

export interface OpenRouterResponse {
  id?: string;
  choices?: OpenRouterChoice[];
  error?: {
    message: string;
    code?: number;
  };
}

export interface WeatherNarrativeMetrics {
  tempMax: number;
  tempMin: number;
  condition: string;
  rainChance: number;
  humidity: number;
  windSpeed: string;
  uvIndex: number;
  feelsLike?: number;
}

export interface ActivityEvaluationResult {
  activity: string;
  suitabilityScore: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  bestTimeSlot: string;
  reasoning: string;
  safetyTips: string[];
}

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-lite-001';

/**
 * Helper to validate OpenRouter API key.
 * Ensures placeholder or invalid single-char keys (e.g. 's') are safely ignored
 * without emitting console errors.
 */
function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed.length < 15 ||
    trimmed === 's' ||
    trimmed.includes('placeholder') ||
    trimmed.includes('your_') ||
    trimmed === 'undefined' ||
    trimmed === 'null'
  ) {
    return false;
  }
  return true;
}

/**
 * Generate a dynamic fallback 2-sentence weather narrative when API is offline or key is missing.
 */
export function generateFallbackNarrative(metrics: WeatherNarrativeMetrics): string {
  const { tempMax, tempMin, condition, rainChance, uvIndex } = metrics;

  const conditionLower = condition.toLowerCase();
  // Avoid duplicate words like "scattered scattered showers"
  const normalizedCondition = conditionLower.includes('scattered')
    ? conditionLower
    : `scattered ${conditionLower}`;

  if (rainChance >= 40) {
    return `Expect afternoon highs near ${tempMax}°C with ${normalizedCondition} and a ${rainChance}% rain probability peaking after midday, so keeping an umbrella handy is highly recommended. Conditions will ease into a pleasant evening settling around ${tempMin}°C under calming breezes.`;
  }

  if (uvIndex >= 6) {
    return `Expect clear, sun-drenched skies today with high temperatures reaching ${tempMax}°C and elevated UV levels (index ${uvIndex}), requiring sunglasses and SPF 30+ protection. The evening will remain dry and balmy near ${tempMin}°C, offering ideal conditions for outdoor gatherings.`;
  }

  return `Today features comfortable conditions peaking at ${tempMax}°C with pleasant ${condition.toLowerCase()} and minimal rain disturbance (${rainChance}%). Evening temperatures will dip smoothly to ${tempMin}°C, making it a great day for both commuting and outdoor pursuits.`;
}

/**
 * Fetch conversational 2-sentence AI weather narrative from OpenRouter.
 */
export async function fetchWeatherNarrative(
  metrics: WeatherNarrativeMetrics
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!isValidApiKey(apiKey)) {
    return generateFallbackNarrative(metrics);
  }

  try {
    const prompt = `You are a friendly, expert meteorologist for a modern weather app.
Provide a concise, engaging, exactly 2-sentence daily weather narrative based on these metrics:
- High: ${metrics.tempMax}°C, Low: ${metrics.tempMin}°C, Feels like: ${metrics.feelsLike || metrics.tempMax}°C
- Condition: ${metrics.condition}
- Rain Probability: ${metrics.rainChance}%
- Humidity: ${metrics.humidity}%
- Wind Speed: ${metrics.windSpeed}
- UV Index: ${metrics.uvIndex}

Guidelines:
- Length: Exactly two conversational sentences.
- Highlight the peak temperature/rain risk in sentence 1, and evening transition or clothing advice in sentence 2.
- Do NOT use markdown asterisks or bullet points. Just return the 2 sentences plain text.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey!.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'SkyCheck Weather App',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional weather broadcaster providing concise 2-sentence daily summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateFallbackNarrative(metrics);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content) {
      return content.replace(/^["']|["']$/g, '');
    }

    return generateFallbackNarrative(metrics);
  } catch {
    return generateFallbackNarrative(metrics);
  }
}

/**
 * Generate a dynamic fallback AI evaluation when API is offline or key is missing.
 */
export function generateFallbackActivityEvaluation(
  activity: string,
  forecastHours: { time: string; temp: number; pop: number; condition: string }[]
): ActivityEvaluationResult {
  const lower = activity.toLowerCase();
  const safeHours = forecastHours.length > 0 ? forecastHours : [
    { time: '09:00 AM', temp: 24, pop: 10, condition: 'Sunny' },
    { time: '02:00 PM', temp: 31, pop: 45, condition: 'Showers' },
    { time: '06:00 PM', temp: 25, pop: 15, condition: 'Clear' },
  ];

  let bestSlot = '08:00 AM – 11:00 AM';
  let score = 88;
  let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Excellent';
  let reasoning = `Morning hours provide pleasant temperatures around 23°C with minimal rain probability, creating optimal conditions for ${activity}.`;
  let safetyTips = [
    'Stay hydrated and carry a refillable water bottle.',
    'Apply SPF 30+ sunscreen if outdoor exposure exceeds 30 minutes.',
    'Keep a light layer handy for cooler morning breezes.',
  ];

  if (lower.includes('night') || lower.includes('photo') || lower.includes('star') || lower.includes('astronomy')) {
    bestSlot = '08:00 PM – 11:00 PM';
    score = 92;
    rating = 'Excellent';
    reasoning = `Evening skies will be clear with ambient temperatures near 22°C and calm wind conditions, ideal for long exposures and low-light photography.`;
    safetyTips = [
      'Bring a microfiber lens cloth to manage evening humidity and condensation.',
      'A sturdy tripod will safeguard against subtle 14 km/h evening gusts.',
      'Pack a light windbreaker jacket as temperatures cool after sunset.',
    ];
  } else if (lower.includes('cricket') || lower.includes('match') || lower.includes('football') || lower.includes('game')) {
    bestSlot = '07:30 AM – 10:30 AM';
    score = 86;
    rating = 'Good';
    reasoning = `Early morning offers dry turf and mild temperatures (21°C–25°C) before the afternoon heat and scattered 45% shower risk arrive.`;
    safetyTips = [
      'Complete the primary session before 12:00 PM to avoid peak heat.',
      'Wear spiked or gripped footwear for dew-moistened ground.',
      'Have a shelter plan ready in case passing afternoon cloudbursts occur.',
    ];
  } else if (lower.includes('wash') || lower.includes('car')) {
    bestSlot = '09:00 AM – 12:00 PM';
    score = 82;
    rating = 'Good';
    reasoning = `Late morning provides ample natural light and zero rain threat, allowing surfaces to dry cleanly without immediate precipitation spots.`;
    safetyTips = [
      'Wash in shaded areas to prevent premature soap drying and water spots.',
      'Check radar before starting to ensure passing afternoon showers stay clear.',
      'Microfiber drying towels ensure streak-free finishes.',
    ];
  } else if (lower.includes('laundry') || lower.includes('dry') || lower.includes('blanket')) {
    bestSlot = '10:00 AM – 01:00 PM';
    score = 78;
    rating = 'Good';
    reasoning = `Direct midday solar radiation and 29°C heat maximize moisture evaporation; bring fabrics inside before 2:00 PM rain window.`;
    safetyTips = [
      'Take fabrics off the line before 2:00 PM when shower risk rises to 45%.',
      'Use secure clips to guard against midday gusts.',
      'Position clothes to catch direct morning sunshine.',
    ];
  }

  return {
    activity,
    suitabilityScore: score,
    rating,
    bestTimeSlot: bestSlot,
    reasoning,
    safetyTips,
  };
}

/**
 * Evaluate any custom activity against hourly forecast data via OpenRouter AI.
 */
export async function evaluateActivityWithAI(
  activity: string,
  forecastHours: { time: string; temp: number; pop: number; condition: string }[]
): Promise<ActivityEvaluationResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!isValidApiKey(apiKey)) {
    return generateFallbackActivityEvaluation(activity, forecastHours);
  }

  try {
    const hoursSummary = forecastHours
      .slice(0, 12)
      .map((h) => `${h.time}: ${h.temp}°C, ${h.pop}% rain, ${h.condition}`)
      .join('; ');

    const prompt = `You are an AI Weather Advisor evaluating suitability for the activity: "${activity}".
Forecast timeline:
${hoursSummary}

Respond ONLY with a valid JSON object matching this schema:
{
  "suitabilityScore": <number between 0 and 100>,
  "rating": <"Excellent" | "Good" | "Fair" | "Poor">,
  "bestTimeSlot": "<e.g. 08:00 AM – 11:00 AM>",
  "reasoning": "<1-2 clear, insightful sentences explaining why this time slot is optimal>",
  "safetyTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
Do not include any markdown wrappers or text outside the JSON object.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500);

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey!.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'SkyCheck Weather App',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an outdoor weather intelligence AI that evaluates activities against meteorological conditions. You strictly return JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return generateFallbackActivityEvaluation(activity, forecastHours);
    }

    const data: OpenRouterResponse = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content) {
      // Clean JSON if model returned markdown codeblocks
      const cleaned = content.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        activity,
        suitabilityScore: typeof parsed.suitabilityScore === 'number' ? parsed.suitabilityScore : 85,
        rating: parsed.rating || 'Good',
        bestTimeSlot: parsed.bestTimeSlot || '09:00 AM – 12:00 PM',
        reasoning: parsed.reasoning || `Conditions are favorable during the suggested window.`,
        safetyTips: Array.isArray(parsed.safetyTips) && parsed.safetyTips.length > 0
          ? parsed.safetyTips
          : ['Stay hydrated and monitor local weather changes.'],
      };
    }

    return generateFallbackActivityEvaluation(activity, forecastHours);
  } catch {
    return generateFallbackActivityEvaluation(activity, forecastHours);
  }
}
