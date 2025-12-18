import { Link } from 'react-router-dom';
import { KaboolyBanner } from '../KaboolyBanner/KaboolyBanner';
import { SearchBox } from '../SearchBox/SearchBox';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
}

export function Layout({ children, showSearch = true }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <KaboolyBanner />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>Do I Need A Brolly?</Link>
          {showSearch && (
            <div className={styles.searchWrapper}>
              <SearchBox placeholder="Search location..." />
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <nav className={styles.footerNav}>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
          <p className={styles.attribution}>
            Weather data from{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
              Open-Meteo
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
