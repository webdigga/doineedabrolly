import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <nav className={styles.nav}>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
        <p className={styles.attribution}>
          Weather data from{' '}
          <a href="https://www.weatherapi.com" target="_blank" rel="noopener noreferrer">
            WeatherAPI.com
          </a>
        </p>
        <p className={styles.attribution}>
          Built by{' '}
          <a href="https://kabooly.com/?utm_source=doineedabrolly&utm_medium=footer&utm_campaign=weather" target="_blank" rel="noopener noreferrer">
            Kabooly
          </a>
        </p>
      </div>
    </footer>
  );
}
