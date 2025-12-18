import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <nav className={styles.nav}>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <p className={styles.attribution}>
          Weather data from{' '}
          <a href="https://www.weatherapi.com" target="_blank" rel="noopener noreferrer">
            WeatherAPI.com
          </a>
        </p>
        <p className={styles.attribution}>
          Built by{' '}
          <a href="https://kabooly.com" target="_blank" rel="noopener noreferrer">
            Kabooly
          </a>
        </p>
      </div>
    </footer>
  );
}
