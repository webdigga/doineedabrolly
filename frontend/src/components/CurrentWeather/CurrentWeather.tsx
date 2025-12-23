import type { CurrentWeather as CurrentWeatherType } from '../../../functions/_shared/types';
import { getWeatherIcon, getWeatherDescription, formatTemp } from '../../utils/weather';
import styles from './CurrentWeather.module.css';

interface CurrentWeatherProps {
  current: CurrentWeatherType;
}

export function CurrentWeather({ current }: CurrentWeatherProps) {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <span className={styles.icon}>
          {getWeatherIcon(current.weatherCode, current.isDay)}
        </span>
        <span className={styles.temp}>{formatTemp(current.temperature)}</span>
      </div>

      <div className={styles.details}>
        <p className={styles.description}>
          {getWeatherDescription(current.weatherCode)}
        </p>
        <p className={styles.feelsLike}>
          Feels like {formatTemp(current.feelsLike)}
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Humidity</span>
          <span className={styles.statValue}>{current.humidity}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Wind</span>
          <span className={styles.statValue}>{Math.round(current.windSpeed)} km/h</span>
        </div>
      </div>
    </div>
  );
}
