import styles from './loading-spinner.module.css'

const LoadingSpinner = () => (
  <div role="status" className={styles.wrapper}>
    <span className={styles.spinner} aria-hidden="true" />
    <span className="visually-hidden">Загрузка данных…</span>
  </div>
)

export default LoadingSpinner
