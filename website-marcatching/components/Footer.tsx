import styles from './Footer.module.css'

export default function Footer({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const year = new Date().getFullYear()
  return (
    <footer className={`${styles.footer} ${variant === 'light' ? styles.footerLight : ''}`}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {year} <strong>Marcatching</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
