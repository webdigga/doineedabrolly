export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
}

export interface ForecastDay {
  date: string;
  sunrise: string;
  sunset: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  weatherCode: number;
  uvIndexMax: number;
  hourly: HourlyForecast[];
}

export interface Forecast {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  current: CurrentWeather;
  daily: ForecastDay[];
}

export interface Location {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

export interface LocationSearchResponse {
  results: Location[];
  total: number;
}

export interface PlainEnglishSummary {
  headline: string;
  today: string;
  tomorrow: string;
  weekend: string;
  bestDay: string | null;
}

export interface WeatherResponse extends Forecast {
  summary: PlainEnglishSummary;
}
