import type { Forecast, CurrentWeather, ForecastDay, HourlyForecast } from './types';

const WEATHER_API_BASE = 'https://api.weatherapi.com/v1/forecast.json';

interface WeatherApiResponse {
  location: {
    lat: number;
    lon: number;
    tz_id: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    wind_degree: number;
    uv: number;
    is_day: number;
    condition: {
      code: number;
      text: string;
    };
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        totalprecip_mm: number;
        uv: number;
        condition: {
          code: number;
          text: string;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        chance_of_rain: number;
        precip_mm: number;
        wind_kph: number;
        is_day: number;
        condition: {
          code: number;
          text: string;
        };
      }>;
    }>;
  };
}

// Map WeatherAPI.com condition codes to WMO codes for compatibility
function mapToWmoCode(code: number): number {
  // WeatherAPI codes: https://www.weatherapi.com/docs/weather_conditions.json
  // Map to WMO codes for our existing plain English logic
  const mapping: Record<number, number> = {
    1000: 0,  // Sunny/Clear -> Clear sky
    1003: 2,  // Partly cloudy
    1006: 3,  // Cloudy
    1009: 3,  // Overcast
    1030: 45, // Mist -> Fog
    1063: 80, // Patchy rain possible -> Light showers
    1066: 85, // Patchy snow possible -> Light snow showers
    1069: 85, // Patchy sleet possible
    1072: 56, // Patchy freezing drizzle
    1087: 95, // Thundery outbreaks possible
    1114: 71, // Blowing snow -> Light snow
    1117: 75, // Blizzard -> Heavy snow
    1135: 45, // Fog
    1147: 48, // Freezing fog
    1150: 51, // Patchy light drizzle
    1153: 51, // Light drizzle
    1168: 56, // Freezing drizzle
    1171: 57, // Heavy freezing drizzle
    1180: 61, // Patchy light rain
    1183: 61, // Light rain
    1186: 63, // Moderate rain at times
    1189: 63, // Moderate rain
    1192: 65, // Heavy rain at times
    1195: 65, // Heavy rain
    1198: 66, // Light freezing rain
    1201: 67, // Moderate/heavy freezing rain
    1204: 85, // Light sleet
    1207: 86, // Moderate/heavy sleet
    1210: 71, // Patchy light snow
    1213: 71, // Light snow
    1216: 73, // Patchy moderate snow
    1219: 73, // Moderate snow
    1222: 75, // Patchy heavy snow
    1225: 75, // Heavy snow
    1237: 77, // Ice pellets
    1240: 80, // Light rain shower
    1243: 81, // Moderate/heavy rain shower
    1246: 82, // Torrential rain shower
    1249: 85, // Light sleet showers
    1252: 86, // Moderate/heavy sleet showers
    1255: 85, // Light snow showers
    1258: 86, // Moderate/heavy snow showers
    1261: 77, // Light showers of ice pellets
    1264: 77, // Moderate/heavy showers of ice pellets
    1273: 95, // Patchy light rain with thunder
    1276: 95, // Moderate/heavy rain with thunder
    1279: 95, // Patchy light snow with thunder
    1282: 95, // Moderate/heavy snow with thunder
  };
  return mapping[code] ?? 3; // Default to overcast
}

function transformCurrentWeather(current: WeatherApiResponse['current']): CurrentWeather {
  return {
    temperature: current.temp_c,
    feelsLike: current.feelslike_c,
    humidity: current.humidity,
    windSpeed: current.wind_kph,
    windDirection: current.wind_degree,
    uvIndex: current.uv,
    weatherCode: mapToWmoCode(current.condition.code),
    isDay: current.is_day === 1,
  };
}

function parseTime(dateStr: string, timeStr: string): string {
  // Convert "06:30 AM" format to ISO
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  return `${dateStr}T${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function transformHourlyForecast(hours: WeatherApiResponse['forecast']['forecastday'][0]['hour']): HourlyForecast[] {
  return hours.map(hour => ({
    time: hour.time,
    temperature: hour.temp_c,
    precipitationProbability: hour.chance_of_rain,
    precipitation: hour.precip_mm,
    weatherCode: mapToWmoCode(hour.condition.code),
    windSpeed: hour.wind_kph,
    isDay: hour.is_day === 1,
  }));
}

function transformDailyForecast(forecastDays: WeatherApiResponse['forecast']['forecastday']): ForecastDay[] {
  return forecastDays.map(day => ({
    date: day.date,
    sunrise: parseTime(day.date, day.astro.sunrise),
    sunset: parseTime(day.date, day.astro.sunset),
    temperatureMax: day.day.maxtemp_c,
    temperatureMin: day.day.mintemp_c,
    precipitationProbability: day.day.daily_chance_of_rain,
    precipitationSum: day.day.totalprecip_mm,
    weatherCode: mapToWmoCode(day.day.condition.code),
    uvIndexMax: day.day.uv,
    hourly: transformHourlyForecast(day.hour),
  }));
}

function transformWeatherApiResponse(data: WeatherApiResponse): Forecast {
  return {
    location: {
      lat: data.location.lat,
      lon: data.location.lon,
      timezone: data.location.tz_id,
    },
    current: transformCurrentWeather(data.current),
    daily: transformDailyForecast(data.forecast.forecastday),
  };
}

export async function getForecast(lat: number, lon: number, days: number, apiKey: string): Promise<Forecast> {
  if (!apiKey) {
    throw new Error('WeatherAPI.com API key is required');
  }

  const params = new URLSearchParams({
    key: apiKey,
    q: `${lat},${lon}`,
    days: Math.min(days, 14).toString(), // WeatherAPI.com supports up to 14 days on paid plans, 3 on free
    aqi: 'no',
    alerts: 'no',
  });

  const response = await fetch(`${WEATHER_API_BASE}?${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WeatherAPI.com error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: WeatherApiResponse = await response.json();
  return transformWeatherApiResponse(data);
}
