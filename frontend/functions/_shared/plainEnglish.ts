import type { Forecast, ForecastDay, HourlyForecast, PlainEnglishSummary } from './types';
import { isRainyCode, isSnowyCode, isNiceCode, getWeatherDescription } from './weatherCodes';

// Time period helpers
function getHourFromTime(time: string): number {
  return new Date(time).getHours();
}

function getDayOfWeek(date: string): number {
  return new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
}

function getDayName(date: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getDayOfWeek(date)];
}

// Temperature descriptions
function describeTemperature(temp: number): string {
  if (temp < 0) return 'freezing';
  if (temp < 5) return 'very cold';
  if (temp < 10) return 'cold';
  if (temp < 15) return 'cool';
  if (temp < 20) return 'mild';
  if (temp < 25) return 'warm';
  if (temp < 30) return 'hot';
  return 'very hot';
}

// Time of day descriptions
function describeTimeOfDay(hour: number): string {
  if (hour < 6) return 'overnight';
  if (hour < 9) return 'early morning';
  if (hour < 12) return 'this morning';
  if (hour < 14) return 'around lunchtime';
  if (hour < 17) return 'this afternoon';
  if (hour < 20) return 'this evening';
  return 'tonight';
}

function describeHour(hour: number): string {
  if (hour === 0) return 'midnight';
  if (hour === 12) return 'midday';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

// Find when rain starts/stops in hourly data
interface RainPeriod {
  startsAt: number | null; // hour
  endsAt: number | null;   // hour
  isCurrentlyRaining: boolean;
}

function analyzeRainPeriods(hourly: HourlyForecast[], currentHour: number = 0): RainPeriod {
  const RAIN_THRESHOLD = 40; // precipitation probability threshold

  let startsAt: number | null = null;
  let endsAt: number | null = null;
  let isCurrentlyRaining = false;

  // Only look at hours from current time onwards
  const relevantHours = hourly.filter(h => getHourFromTime(h.time) >= currentHour);

  if (relevantHours.length === 0) {
    return { startsAt: null, endsAt: null, isCurrentlyRaining: false };
  }

  // Check if it's currently raining
  const firstHour = relevantHours[0];
  isCurrentlyRaining = firstHour.precipitationProbability >= RAIN_THRESHOLD || isRainyCode(firstHour.weatherCode);

  if (isCurrentlyRaining) {
    // Find when rain ends
    for (const hour of relevantHours) {
      if (hour.precipitationProbability < RAIN_THRESHOLD && !isRainyCode(hour.weatherCode)) {
        endsAt = getHourFromTime(hour.time);
        break;
      }
    }
  } else {
    // Find when rain starts
    for (const hour of relevantHours) {
      if (hour.precipitationProbability >= RAIN_THRESHOLD || isRainyCode(hour.weatherCode)) {
        startsAt = getHourFromTime(hour.time);
        break;
      }
    }
  }

  return { startsAt, endsAt, isCurrentlyRaining };
}

// Calculate remaining day's max precipitation probability from hourly data
function getRemainingMaxPrecipProb(hourly: HourlyForecast[], currentHour: number): number {
  const relevantHours = hourly.filter(h => getHourFromTime(h.time) >= currentHour);
  if (relevantHours.length === 0) return 0;
  return Math.max(...relevantHours.map(h => h.precipitationProbability));
}

// Generate the "brolly" headline
function generateHeadline(today: ForecastDay, currentHour: number): string {
  // Use remaining hours' max probability, not the whole day's max
  const rainProb = getRemainingMaxPrecipProb(today.hourly, currentHour);
  const rainAnalysis = analyzeRainPeriods(today.hourly, currentHour);

  // Check for snow first
  if (isSnowyCode(today.weatherCode)) {
    return "Snow expected today - wrap up warm";
  }

  // High confidence rain
  if (rainProb >= 80) {
    if (rainAnalysis.isCurrentlyRaining) {
      if (rainAnalysis.endsAt) {
        return `Keep your brolly handy until ${describeHour(rainAnalysis.endsAt)}`;
      }
      return "You'll need your brolly - rain all day";
    }
    if (rainAnalysis.startsAt !== null) {
      return `Grab your brolly - rain from ${describeHour(rainAnalysis.startsAt)}`;
    }
    return "Definitely need your brolly today";
  }

  // Likely rain
  if (rainProb >= 60) {
    if (rainAnalysis.startsAt !== null) {
      return `Pack your brolly - rain likely ${describeTimeOfDay(rainAnalysis.startsAt)}`;
    }
    return "Pack your brolly just in case";
  }

  // Possible rain
  if (rainProb >= 40) {
    return "Maybe pack a brolly - rain possible";
  }

  // Unlikely rain
  if (rainProb >= 20) {
    return "Probably won't need your brolly";
  }

  // Very unlikely rain
  return "Leave the brolly at home";
}

// Describe a single day's weather
function describeDay(day: ForecastDay, currentHour: number = 0): string {
  const rainAnalysis = analyzeRainPeriods(day.hourly, currentHour);
  const tempDesc = describeTemperature(day.temperatureMax);
  const weatherDesc = getWeatherDescription(day.weatherCode);

  // Snow takes priority
  if (isSnowyCode(day.weatherCode)) {
    return `Snow expected, ${tempDesc} with highs of ${Math.round(day.temperatureMax)}°C`;
  }

  // If currently raining
  if (rainAnalysis.isCurrentlyRaining) {
    if (rainAnalysis.endsAt !== null) {
      const clearingTime = describeTimeOfDay(rainAnalysis.endsAt);
      if (rainAnalysis.endsAt < 12) {
        return `A wet start, brightening up ${clearingTime}`;
      }
      return `Rain clearing ${clearingTime}, then dry`;
    }
    return `Rain for most of the day, ${tempDesc}`;
  }

  // If rain coming later
  if (rainAnalysis.startsAt !== null) {
    const rainTime = describeTimeOfDay(rainAnalysis.startsAt);
    if (rainAnalysis.startsAt < 12) {
      return `Dry early, rain arriving ${rainTime}`;
    }
    if (rainAnalysis.startsAt < 17) {
      return `Dry this morning, rain ${rainTime}`;
    }
    return `Staying dry until ${rainTime}`;
  }

  // No significant rain expected
  if (isNiceCode(day.weatherCode)) {
    if (day.temperatureMax >= 20) {
      return `A lovely ${tempDesc} day with ${weatherDesc}`;
    }
    return `${weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)} and ${tempDesc}`;
  }

  // Overcast but dry
  if (day.weatherCode === 3) {
    return `Grey and overcast, staying dry, ${tempDesc}`;
  }

  // Default
  return `${weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)}, highs of ${Math.round(day.temperatureMax)}°C`;
}

// Describe the weekend
function describeWeekend(daily: ForecastDay[]): string {
  // Find Saturday and Sunday
  const saturday = daily.find(d => getDayOfWeek(d.date) === 6);
  const sunday = daily.find(d => getDayOfWeek(d.date) === 0);

  if (!saturday && !sunday) {
    return "Weekend forecast not yet available";
  }

  if (!saturday) {
    return sunday ? `Sunday: ${describeDay(sunday)}` : "Weekend forecast not available";
  }

  if (!sunday) {
    return `Saturday: ${describeDay(saturday)}`;
  }

  const satRain = saturday.precipitationProbability;
  const sunRain = sunday.precipitationProbability;
  const satNice = satRain < 30 && isNiceCode(saturday.weatherCode);
  const sunNice = sunRain < 30 && isNiceCode(sunday.weatherCode);

  // Both days similar
  if (Math.abs(satRain - sunRain) < 20) {
    if (satNice && sunNice) {
      return "Both days looking good";
    }
    if (satRain >= 60 && sunRain >= 60) {
      return "Wet weekend ahead";
    }
    return "Mixed conditions both days";
  }

  // One day clearly better
  if (satNice && !sunNice) {
    return "Saturday looks better than Sunday";
  }
  if (sunNice && !satNice) {
    return "Sunday looks better than Saturday";
  }
  if (satRain < sunRain) {
    return "Saturday drier than Sunday";
  }
  return "Sunday drier than Saturday";
}

// Calculate days between two dates (ignoring time)
function getDaysDifference(fromDate: Date, toDate: Date): number {
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  const diffMs = to.getTime() - from.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Find the best day in the forecast
function findBestDay(daily: ForecastDay[]): string | null {
  if (daily.length < 3) {
    return null;
  }

  // Skip today (index 0), look at rest of week
  const futureDays = daily.slice(1);

  let bestDay: ForecastDay | null = null;
  let bestScore = -Infinity;

  for (const day of futureDays) {
    // Score based on: low rain probability, nice weather code, pleasant temperature
    let score = 100 - day.precipitationProbability;

    if (isNiceCode(day.weatherCode)) {
      score += 30;
    } else if (day.weatherCode === 3) {
      score += 10; // Overcast but dry
    } else if (isRainyCode(day.weatherCode)) {
      score -= 20;
    }

    // Prefer mild temperatures
    if (day.temperatureMax >= 15 && day.temperatureMax <= 22) {
      score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestDay = day;
    }
  }

  if (!bestDay || bestScore < 60) {
    return null; // No particularly good day
  }

  const dayName = getDayName(bestDay.date);
  const today = new Date();
  const bestDayDate = new Date(bestDay.date);
  const daysAway = getDaysDifference(today, bestDayDate);

  // For tomorrow, use "tomorrow" instead of day name
  if (daysAway === 1) {
    return "Tomorrow is your best bet";
  }

  // For days more than 5 days away, prefix with "next" to avoid confusion
  // (e.g., if today is Friday and best day is next Thursday)
  if (daysAway > 5) {
    return `Next ${dayName} looks like the best day`;
  }

  // For days 2-5 days away, the day name alone is clear enough
  return `${dayName} is your best bet this week`;
}

/**
 * Generate plain English weather summary from forecast data
 */
export function generateSummary(forecast: Forecast): PlainEnglishSummary {
  const { daily } = forecast;
  const now = new Date();
  const currentHour = now.getHours();

  const today = daily[0];
  const tomorrow = daily[1];

  return {
    headline: generateHeadline(today, currentHour),
    today: describeDay(today, currentHour),
    tomorrow: tomorrow ? describeDay(tomorrow) : "Tomorrow's forecast not available",
    weekend: describeWeekend(daily),
    bestDay: findBestDay(daily),
  };
}
