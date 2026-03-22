import { tool } from 'ai';
import { z } from 'zod';

export type GetWeatherResult = {
  city: string;
  temperatureC: number;
  condition: string;
  windKmh: number;
};

const weatherByCity: Record<string, GetWeatherResult> = {
  warsaw: {
    city: 'Warsaw',
    temperatureC: 18,
    condition: 'Cloudy',
    windKmh: 14,
  },
  warszawa: {
    city: 'Warsaw',
    temperatureC: 18,
    condition: 'Cloudy',
    windKmh: 14,
  },
  krakow: {
    city: 'Krakow',
    temperatureC: 20,
    condition: 'Sunny',
    windKmh: 9,
  },
  krakow_pl: {
    city: 'Krakow',
    temperatureC: 20,
    condition: 'Sunny',
    windKmh: 9,
  },
  kraków: {
    city: 'Krakow',
    temperatureC: 20,
    condition: 'Sunny',
    windKmh: 9,
  },
  berlin: {
    city: 'Berlin',
    temperatureC: 16,
    condition: 'Light rain',
    windKmh: 19,
  },
  london: {
    city: 'London',
    temperatureC: 15,
    condition: 'Windy',
    windKmh: 22,
  },
  newyork: {
    city: 'New York',
    temperatureC: 23,
    condition: 'Clear',
    windKmh: 11,
  },
  'new york': {
    city: 'New York',
    temperatureC: 23,
    condition: 'Clear',
    windKmh: 11,
  },
};

export const getWeather = tool({
  description: 'Get demo weather for a city.',
  inputSchema: z.object({
    city: z.string().min(1),
  }),
  execute: async ({ city }): Promise<GetWeatherResult> => {
    console.log(`[tool:getWeather] start ${new Date().toISOString()} city=${city}`);

    const normalized = city.trim().toLowerCase();
    const weather = weatherByCity[normalized] ?? {
      city,
      temperatureC: 17,
      condition: 'Partly cloudy',
      windKmh: 12,
    };

    console.log(
      `[tool:getWeather] success ${new Date().toISOString()} city=${weather.city} temp=${weather.temperatureC}`
    );

    return weather;
  },
});
