import styles from './KaboolyBanner.module.css';

export function KaboolyBanner() {
  return (
    <a
      href="https://kabooly.com/crm/how-it-works/?utm_source=doineedabrolly&utm_medium=banner&utm_campaign=weather"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.banner}
    >
      <span className={styles.text}>
        Need a CRM? Try Kabooly - simple, powerful, and refreshingly easy to use
      </span>
      <span className={styles.cta}>Learn more</span>
    </a>
  );
}
