import { Tool, ToolFilter } from './types'

export const FILTER_OPTIONS: { id: ToolFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'client', label: 'Client Tools' },
  { id: 'mcp', label: 'Connected' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
]

export const INITIAL_TOOLS: Tool[] = [
  {
    id: '1',
    name: 'Fetch Weather',
    description: 'Retrieves current weather, temperature, and forecast data for any specified city or coordinates.',
    type: 'client',
    published: true,
    updatedAt: 'Today',
    parameters: [
      {
        id: 'p1',
        name: 'location',
        type: 'string',
        description: 'City and country, e.g. London, UK or Tokyo',
        required: true,
      },
      {
        id: 'p2',
        name: 'units',
        type: 'string',
        description: 'Temperature scale: metric or imperial',
        required: false,
        defaultValue: 'metric',
      },
    ],
    code: `/**
 * Fetch Weather
 * Retrieves real-time weather, temperature, and forecast data for any specified city.
 *
 * @param {string} args.location - City name, e.g. Tokyo, Paris, or New York
 * @param {string} args.units - Temperature scale: metric or imperial
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function execute(args) {
  try {
    const location = args.location || "Tokyo";
    console.log("Fetching geocoding data for:", location);

    // 1. Geocode city name using Open-Meteo Geocoding API
    const geoUrl = \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(location)}&count=1&language=en&format=json\`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return { success: false, error: \`Location '\${location}' not found.\` };
    }

    const { latitude, longitude, name, country, timezone } = geoData.results[0];
    console.log(\`Resolved \${name}, \${country} at \${latitude}, \${longitude}\`);

    // 2. Fetch current real-time weather
    const weatherUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current_weather=true\`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const isImperial = args.units === "imperial";
    const tempC = weatherData.current_weather.temperature;
    const temp = isImperial ? Math.round((tempC * 9/5) + 32) : tempC;

    return {
      success: true,
      data: {
        city: name,
        country: country,
        timezone: timezone,
        temperature: \`\${temp}\${isImperial ? "°F" : "°C"}\`,
        windSpeed: \`\${weatherData.current_weather.windspeed} km/h\`,
        weatherCode: weatherData.current_weather.weathercode,
        recordedAt: weatherData.current_weather.time
      }
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}`,
    capabilities: {
      network: true,
      storage: false,
      environment: false,
    },
  },
  {
    id: '2',
    name: 'Read User Database',
    description: 'Provides read-only access to query active users, account tiers, and registration dates from PostgreSQL.',
    type: 'mcp',
    published: false,
    updatedAt: 'Yesterday',
    serviceConfig: {
      serviceType: 'postgresql',
      connectionString: 'postgres://readonly_app:secret@db.internal:5432/production',
    },
  },
]
