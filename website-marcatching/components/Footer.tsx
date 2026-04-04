import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {year} <strong>Marcatching</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
