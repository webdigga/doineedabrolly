import { Link } from 'react-router-dom';
import { KaboolyBanner } from '../KaboolyBanner/KaboolyBanner';
import { SideBanners } from '../SideBanners/SideBanners';
import { SearchBox } from '../SearchBox/SearchBox';
import { Footer } from '../Footer/Footer';
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

      <SideBanners />
      <Footer />
    </div>
  );
}
