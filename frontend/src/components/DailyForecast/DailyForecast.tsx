import type { ForecastDay } from '../../types';
import { getWeatherIcon, getWeatherDescription, formatTemp, formatDayName } from '../../utils/weather';
import styles from './DailyForecast.module.css';

interface DailyForecastProps {
  days: ForecastDay[];
}

export function DailyForecast({ days }: DailyForecastProps) {
  const today = new Date().toDateString();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>7-Day Forecast</h3>
      <div className={styles.days}>
        {days.map((day) => {
          const dayDate = new Date(day.date);
          const isToday = dayDate.toDateString() === today;
          const dayName = isToday ? 'Today' : formatDayName(day.date);

          return (
            <div key={day.date} className={styles.day}>
              <span className={styles.dayName}>{dayName}</span>
              <span className={styles.icon}>
                {getWeatherIcon(day.weatherCode, true)}
              </span>
              <span className={styles.description}>
                {getWeatherDescription(day.weatherCode)}
              </span>
              <div className={styles.temps}>
                <span className={styles.high}>{formatTemp(day.temperatureMax)}</span>
                <span className={styles.low}>{formatTemp(day.temperatureMin)}</span>
              </div>
              {day.precipitationProbability > 0 && (
                <span className={styles.rain}>
                  {day.precipitationProbability}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
