import PropTypes from 'prop-types'
import styles from './card.module.css'

const Card = ({ title, subtitle, meta, children, as: Component = 'article' }) => (
  <Component className={styles.card}>
    <div className={styles.header}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {meta ? <span className={styles.meta}>{meta}</span> : null}
    </div>
    <div className={styles.body}>{children}</div>
  </Component>
)

Card.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  meta: PropTypes.node,
  children: PropTypes.node,
  as: PropTypes.elementType,
}

export default Card
