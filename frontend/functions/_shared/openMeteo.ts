import type { Forecast, CurrentWeather, ForecastDay, HourlyForecast } from './types';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    weather_code: number[];
    uv_index_max: number[];
  };
}

function transformCurrentWeather(current: OpenMeteoResponse['current']): CurrentWeather {
  return {
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    uvIndex: 0, // Not available in current, will use daily max
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
  };
}

function transformHourlyForecast(
  hourly: OpenMeteoResponse['hourly'],
  startIndex: number,
  count: number
): HourlyForecast[] {
  const result: HourlyForecast[] = [];

  for (let i = startIndex; i < startIndex + count && i < hourly.time.length; i++) {
    result.push({
      time: hourly.time[i],
      temperature: hourly.temperature_2m[i],
      precipitationProbability: hourly.precipitation_probability[i],
      precipitation: hourly.precipitation[i],
      weatherCode: hourly.weather_code[i],
      windSpeed: hourly.wind_speed_10m[i],
      isDay: hourly.is_day[i] === 1,
    });
  }

  return result;
}

function transformDailyForecast(
  daily: OpenMeteoResponse['daily'],
  hourly: OpenMeteoResponse['hourly']
): ForecastDay[] {
  return daily.time.map((date, index) => {
    // Find hourly data for this day (24 hours starting at midnight)
    const dayStart = index * 24;

    return {
      date,
      sunrise: daily.sunrise[index],
      sunset: daily.sunset[index],
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      precipitationProbability: daily.precipitation_probability_max[index],
      precipitationSum: daily.precipitation_sum[index],
      weatherCode: daily.weather_code[index],
      uvIndexMax: daily.uv_index_max[index],
      hourly: transformHourlyForecast(hourly, dayStart, 24),
    };
  });
}

function transformOpenMeteoResponse(data: OpenMeteoResponse): Forecast {
  return {
    location: {
      lat: data.latitude,
      lon: data.longitude,
      timezone: data.timezone,
    },
    current: transformCurrentWeather(data.current),
    daily: transformDailyForecast(data.daily, data.hourly),
  };
}

export async function getForecast(lat: number, lon: number, days: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'is_day',
    ].join(','),
    daily: [
      'sunrise',
      'sunset',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'weather_code',
      'uv_index_max',
    ].join(','),
    timezone: 'Europe/London',
    forecast_days: days.toString(),
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
  }

  const data: OpenMeteoResponse = await response.json();
  return transformOpenMeteoResponse(data);
}
