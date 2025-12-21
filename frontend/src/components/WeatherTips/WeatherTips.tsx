import { getRemainingMaxPrecipitation } from '../../utils/weather';
import styles from './WeatherTips.module.css';

interface HourlyData {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

interface DailyData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  uvIndexMax: number;
  hourly: HourlyData[];
}

interface WeatherTipsProps {
  locationName: string;
  current: {
    temperature: number;
    windSpeed: number;
    uvIndex: number;
    weatherCode: number;
  };
  today: DailyData;
}

export function WeatherTips({ locationName, current, today }: WeatherTipsProps) {
  const currentHour = new Date().getHours();
  // Use remaining hours' precipitation probability for today
  const remainingRainChance = today.hourly?.length
    ? getRemainingMaxPrecipitation(today.hourly, currentHour)
    : today.precipitationProbability;

  const packingItems = getPackingItems(current, today, remainingRainChance);
  const activities = getActivitySuggestions(current, today, remainingRainChance);
  const bestTime = getBestTimeToGoOut(today.hourly);
  const seasonal = getSeasonalContext(locationName);

  return (
    <section className={styles.section}>
      <h2 id="todays-tips" className={styles.title}>Today's Tips for {locationName}</h2>

      <div className={styles.grid}>
        {/* What to Pack */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>What to Pack</h3>
          <ul className={styles.list}>
            {packingItems.map((item, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activity Suggestions */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Activity Ideas</h3>
          <ul className={styles.list}>
            {activities.map((activity, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.icon}>{activity.icon}</span>
                <span>{activity.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best Time to Go Out */}
        {bestTime && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Best Time to Go Out</h3>
            <p className={styles.highlight}>{bestTime.window}</p>
            <p className={styles.detail}>{bestTime.reason}</p>
          </div>
        )}

        {/* Seasonal Context */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>This Time of Year</h3>
          <p className={styles.detail}>{seasonal.description}</p>
          <p className={styles.detail}>{seasonal.daylight}</p>
        </div>
      </div>
    </section>
  );
}

interface PackingItem {
  icon: string;
  text: string;
}

function getPackingItems(
  current: WeatherTipsProps['current'],
  today: DailyData,
  remainingRainChance: number
): PackingItem[] {
  const items: PackingItem[] = [];
  const temp = current.temperature;
  const rainChance = remainingRainChance;
  const wind = current.windSpeed;
  const uv = today.uvIndexMax;

  // Rain gear
  if (rainChance > 70) {
    items.push({ icon: '☔', text: 'Umbrella essential' });
    items.push({ icon: '🧥', text: 'Waterproof jacket' });
  } else if (rainChance > 40) {
    items.push({ icon: '☂️', text: 'Pack an umbrella just in case' });
  }

  // Temperature-based clothing
  if (temp < 0) {
    items.push({ icon: '🧤', text: 'Hat, gloves and scarf' });
    items.push({ icon: '🧥', text: 'Heavy winter coat' });
  } else if (temp < 5) {
    items.push({ icon: '🧥', text: 'Warm coat' });
    items.push({ icon: '🧤', text: 'Gloves recommended' });
  } else if (temp < 10) {
    items.push({ icon: '🧥', text: 'Jacket or coat' });
  } else if (temp < 15) {
    items.push({ icon: '👕', text: 'Light jacket or layers' });
  } else if (temp > 25) {
    items.push({ icon: '👕', text: 'Light, breathable clothing' });
  }

  // Sun protection
  if (uv >= 6) {
    items.push({ icon: '🧴', text: 'Sunscreen essential (high UV)' });
    items.push({ icon: '🕶️', text: 'Sunglasses' });
  } else if (uv >= 3) {
    items.push({ icon: '🧴', text: 'Sunscreen recommended' });
  }

  // Wind
  if (wind > 40) {
    items.push({ icon: '💨', text: 'Windproof outer layer' });
  } else if (wind > 25) {
    items.push({ icon: '🧥', text: 'Something to block the breeze' });
  }

  // Default if nothing specific
  if (items.length === 0) {
    items.push({ icon: '👍', text: 'No special gear needed' });
    items.push({ icon: '👕', text: 'Dress comfortably' });
  }

  return items.slice(0, 4); // Max 4 items
}

interface ActivitySuggestion {
  icon: string;
  text: string;
}

function getActivitySuggestions(
  current: WeatherTipsProps['current'],
  _today: DailyData,
  remainingRainChance: number
): ActivitySuggestion[] {
  const suggestions: ActivitySuggestion[] = [];
  const temp = current.temperature;
  const rainChance = remainingRainChance;
  const weatherCode = current.weatherCode;

  // Rainy conditions
  if (rainChance > 60 || weatherCode >= 61) {
    suggestions.push({ icon: '🏠', text: 'Good day for indoor activities' });
    suggestions.push({ icon: '☕', text: 'Perfect café or museum weather' });
    suggestions.push({ icon: '🎬', text: 'Cinema or shopping' });
  }
  // Nice weather
  else if (rainChance < 30 && temp >= 10 && temp <= 25) {
    suggestions.push({ icon: '🚶', text: 'Great for a walk or hike' });
    suggestions.push({ icon: '🌳', text: 'Perfect park weather' });
    if (temp > 18) {
      suggestions.push({ icon: '🧺', text: 'Picnic weather' });
    }
  }
  // Hot weather
  else if (temp > 25) {
    suggestions.push({ icon: '🏖️', text: 'Beach or outdoor swimming' });
    suggestions.push({ icon: '🍦', text: 'Ice cream weather' });
    suggestions.push({ icon: '🌳', text: 'Find some shade' });
  }
  // Cold but dry
  else if (temp < 10 && rainChance < 40) {
    suggestions.push({ icon: '🚶', text: 'Brisk walk if wrapped up warm' });
    suggestions.push({ icon: '☕', text: 'Warm up in a cosy café' });
  }
  // Default
  else {
    suggestions.push({ icon: '🚶', text: 'Suitable for outdoor activities' });
    suggestions.push({ icon: '📍', text: 'Good day to explore locally' });
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

interface BestTimeResult {
  window: string;
  reason: string;
}

function getBestTimeToGoOut(hourly: HourlyData[]): BestTimeResult | null {
  // Only look at daytime hours (7am - 9pm)
  const now = new Date();
  const currentHour = now.getHours();

  const daytimeHours = hourly.filter(h => {
    const hour = new Date(h.time).getHours();
    return hour >= 7 && hour <= 21 && hour >= currentHour;
  });

  if (daytimeHours.length === 0) return null;

  // Find the driest window
  let bestStart = 0;
  let bestLength = 0;
  let currentStart = 0;
  let currentLength = 0;

  daytimeHours.forEach((h, i) => {
    if (h.precipitationProbability < 30) {
      if (currentLength === 0) currentStart = i;
      currentLength++;
      if (currentLength > bestLength) {
        bestLength = currentLength;
        bestStart = currentStart;
      }
    } else {
      currentLength = 0;
    }
  });

  // If mostly dry all day
  const avgRainChance = daytimeHours.reduce((sum, h) => sum + h.precipitationProbability, 0) / daytimeHours.length;

  if (avgRainChance < 20) {
    return {
      window: 'Any time today',
      reason: 'Low chance of rain throughout the day'
    };
  }

  if (bestLength >= 2) {
    const startHour = new Date(daytimeHours[bestStart].time).getHours();
    const endHour = new Date(daytimeHours[bestStart + bestLength - 1].time).getHours() + 1;
    return {
      window: `${formatHour(startHour)} - ${formatHour(endHour)}`,
      reason: 'Driest window of the day'
    };
  }

  // Find when rain starts/stops
  const firstRainyHour = daytimeHours.find(h => h.precipitationProbability > 50);
  const firstDryHour = daytimeHours.find(h => h.precipitationProbability < 30);

  if (firstRainyHour && !firstDryHour) {
    const rainHour = new Date(firstRainyHour.time).getHours();
    if (rainHour > currentHour + 1) {
      return {
        window: `Before ${formatHour(rainHour)}`,
        reason: 'Rain expected later'
      };
    }
  }

  return {
    window: 'No ideal window',
    reason: 'Changeable conditions throughout the day'
  };
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

interface SeasonalInfo {
  description: string;
  daylight: string;
}

function getSeasonalContext(locationName: string): SeasonalInfo {
  const now = new Date();
  const month = now.getMonth();

  // Approximate sunrise/sunset times for UK
  const daylightHours: Record<number, { hours: number; trend: string }> = {
    0: { hours: 8, trend: 'Days are starting to lengthen' },
    1: { hours: 9, trend: 'Noticeably longer days' },
    2: { hours: 11, trend: 'Spring equinox approaches' },
    3: { hours: 13, trend: 'Days lengthening quickly' },
    4: { hours: 15, trend: 'Long evenings' },
    5: { hours: 16.5, trend: 'Near the longest days' },
    6: { hours: 16.5, trend: 'Peak daylight hours' },
    7: { hours: 15, trend: 'Days starting to shorten' },
    8: { hours: 13, trend: 'Autumn equinox approaches' },
    9: { hours: 11, trend: 'Shorter days arriving' },
    10: { hours: 9, trend: 'Dark evenings' },
    11: { hours: 8, trend: 'Near the shortest days' },
  };

  const seasonDescriptions: Record<string, string> = {
    winter: `Winter in ${locationName}. Expect cold temperatures and early darkness.`,
    spring: `Spring in ${locationName}. Weather can be changeable - layers recommended.`,
    summer: `Summer in ${locationName}. Generally the warmest and driest season.`,
    autumn: `Autumn in ${locationName}. Temperatures cooling and leaves changing.`,
  };

  let season: string;
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';

  const daylight = daylightHours[month];

  return {
    description: seasonDescriptions[season],
    daylight: `About ${daylight.hours} hours of daylight. ${daylight.trend}.`
  };
}
