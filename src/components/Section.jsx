import PropTypes from 'prop-types'
import styles from './section.module.css'

const Section = ({ title, description, action, children }) => (
  <section className={styles.section}>
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
    <div className={styles.content}>{children}</div>
  </section>
)

Section.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
}

export default Section
