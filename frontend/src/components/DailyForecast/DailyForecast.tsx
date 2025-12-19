import type { ForecastDay } from '../../types';
import { getWeatherIcon, getWeatherDescription, formatTemp, formatDayName, getRemainingWeatherCode, getRemainingMaxPrecipitation } from '../../utils/weather';
import styles from './DailyForecast.module.css';

interface DailyForecastProps {
  days: ForecastDay[];
}

export function DailyForecast({ days }: DailyForecastProps) {
  const now = new Date();
  const today = now.toDateString();
  const currentHour = now.getHours();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>7-Day Forecast</h3>
      <div className={styles.days}>
        {days.map((day) => {
          const dayDate = new Date(day.date);
          const isToday = dayDate.toDateString() === today;
          const dayName = isToday ? 'Today' : formatDayName(day.date);

          // For today, use remaining hours' data; for future days, use daily data
          const hasHourlyData = day.hourly?.length > 0;
          const weatherCode = isToday && hasHourlyData
            ? getRemainingWeatherCode(day.hourly, currentHour)
            : day.weatherCode;
          const precipProb = isToday && hasHourlyData
            ? getRemainingMaxPrecipitation(day.hourly, currentHour)
            : day.precipitationProbability;

          return (
            <div key={day.date} className={styles.day}>
              <span className={styles.dayName}>{dayName}</span>
              <span className={styles.icon}>
                {getWeatherIcon(weatherCode, true)}
              </span>
              <span className={styles.description}>
                {getWeatherDescription(weatherCode)}
              </span>
              <div className={styles.temps}>
                <span className={styles.high}>{formatTemp(day.temperatureMax)}</span>
                <span className={styles.low}>{formatTemp(day.temperatureMin)}</span>
              </div>
              {precipProb > 0 && (
                <span className={styles.rain}>
                  {precipProb}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
