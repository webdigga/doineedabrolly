import type { HourlyForecast as HourlyForecastType } from '../../types';
import { getWeatherIcon, formatTemp, formatHour } from '../../utils/weather';
import styles from './HourlyForecast.module.css';

interface HourlyForecastProps {
  hours: HourlyForecastType[];
  title?: string;
}

export function HourlyForecast({ hours, title = "Hourly Forecast" }: HourlyForecastProps) {
  // Show next 24 hours, filtering past hours for today
  const now = new Date();
  const currentHour = now.getHours();

  const relevantHours = hours.filter(hour => {
    const hourTime = new Date(hour.time);
    return hourTime >= now || hourTime.getHours() >= currentHour;
  }).slice(0, 24);

  if (relevantHours.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.scrollContainer}>
        <div className={styles.hours}>
          {relevantHours.map((hour) => (
            <div key={hour.time} className={styles.hour}>
              <span className={styles.time}>{formatHour(hour.time)}</span>
              <span className={styles.icon}>
                {getWeatherIcon(hour.weatherCode, hour.isDay)}
              </span>
              <span className={styles.temp}>{formatTemp(hour.temperature)}</span>
              {hour.precipitationProbability > 0 && (
                <span className={styles.rain}>
                  {hour.precipitationProbability}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
