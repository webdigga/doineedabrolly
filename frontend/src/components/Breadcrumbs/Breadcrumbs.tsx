import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

const DOMAIN = 'https://doineedabrolly.co.uk';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];

  return (
    <>
      <BreadcrumbStructuredData items={allItems} />
      <nav className={styles.nav} aria-label="Breadcrumb">
        <ol className={styles.list}>
          {allItems.map((item, index) => (
            <li key={index} className={styles.item}>
              {index > 0 && <span className={styles.separator}>/</span>}
              {item.href && index < allItems.length - 1 ? (
                <Link to={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${DOMAIN}${item.href}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WeatherBreadcrumbsProps {
  locationName: string;
  county?: string;
  countySlug?: string;
  slug: string;
}

export function WeatherBreadcrumbs({ locationName, county, countySlug, slug }: WeatherBreadcrumbsProps) {
  const items: BreadcrumbItem[] = [];

  if (county) {
    // Only link county if we have a countySlug (meaning a county page exists)
    items.push({
      label: county,
      href: countySlug ? `/county/${countySlug}` : undefined
    });
  }

  // Use countySlug in the weather page URL
  const weatherHref = countySlug ? `/weather/${countySlug}/${slug}` : `/weather/${slug}`;
  items.push({ label: `${locationName} Weather`, href: weatherHref });

  return <Breadcrumbs items={items} />;
}
