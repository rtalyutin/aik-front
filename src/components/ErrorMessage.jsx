import PropTypes from 'prop-types'
import styles from './error-message.module.css'

const ErrorMessage = ({ title, message, onRetry }) => (
  <div className={styles.wrapper} role="alert">
    <div>
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
    {onRetry ? (
      <button type="button" className={styles.button} onClick={onRetry}>
        Повторить запрос
      </button>
    ) : null}
  </div>
)

ErrorMessage.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
}

export default ErrorMessage
