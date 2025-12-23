import type { PlainEnglishSummary } from '../../../functions/_shared/types';
import styles from './WeatherSummary.module.css';

interface WeatherSummaryProps {
  summary: PlainEnglishSummary;
}

export function WeatherSummary({ summary }: WeatherSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.headline}>
        <h2 id="summary" className={styles.headlineText}>{summary.headline}</h2>
      </div>

      <div className={styles.summaries}>
        <div className={styles.summaryCard}>
          <h3 className={styles.cardTitle}>Today</h3>
          <p className={styles.cardText}>{summary.today}</p>
        </div>

        <div className={styles.summaryCard}>
          <h3 className={styles.cardTitle}>Tomorrow</h3>
          <p className={styles.cardText}>{summary.tomorrow}</p>
        </div>

        <div className={styles.summaryCard}>
          <h3 className={styles.cardTitle}>Weekend</h3>
          <p className={styles.cardText}>{summary.weekend}</p>
        </div>
      </div>

      {summary.bestDay && (
        <p className={styles.bestDay}>{summary.bestDay}</p>
      )}
    </div>
  );
}
