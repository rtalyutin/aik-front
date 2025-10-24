import styles from './footer.module.css'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div>
        <p className={styles.title}>AIK Front</p>
        <p className={styles.caption}>© {year}. Все права защищены.</p>
      </div>
      <div className={styles.links}>
        <a href="/docs" className={styles.link}>
          Документация
        </a>
        <a href="mailto:support@aik-front.test" className={styles.link}>
          Поддержка
        </a>
      </div>
    </footer>
  )
}

export default Footer
