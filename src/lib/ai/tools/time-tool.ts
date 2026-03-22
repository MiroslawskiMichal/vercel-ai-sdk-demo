import { tool } from 'ai';
import { z } from 'zod';

export type GetCurrentTimeResult = {
  location: string;
  timezone: string;
  localTime: string;
};

const timezonesByLocation: Record<string, { location: string; timezone: string }> = {
  warsaw: { location: 'Warsaw', timezone: 'Europe/Warsaw' },
  warszawa: { location: 'Warsaw', timezone: 'Europe/Warsaw' },
  krakow: { location: 'Krakow', timezone: 'Europe/Warsaw' },
  kraków: { location: 'Krakow', timezone: 'Europe/Warsaw' },
  berlin: { location: 'Berlin', timezone: 'Europe/Berlin' },
  london: { location: 'London', timezone: 'Europe/London' },
  'new york': { location: 'New York', timezone: 'America/New_York' },
  newyork: { location: 'New York', timezone: 'America/New_York' },
  tokyo: { location: 'Tokyo', timezone: 'Asia/Tokyo' },
};

export const getCurrentTime = tool({
  description: 'Get the current local time for a city.',
  inputSchema: z.object({
    location: z.string().min(1),
  }),
  execute: async ({ location }): Promise<GetCurrentTimeResult> => {
    console.log(
      `[tool:getCurrentTime] start ${new Date().toISOString()} location=${location}`
    );

    const normalized = location.trim().toLowerCase();
    const match = timezonesByLocation[normalized] ?? {
      location,
      timezone: 'UTC',
    };

    const localTime = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: match.timezone,
    }).format(new Date());

    console.log(
      `[tool:getCurrentTime] success ${new Date().toISOString()} location=${match.location} timezone=${match.timezone}`
    );

    return {
      location: match.location,
      timezone: match.timezone,
      localTime,
    };
  },
});
