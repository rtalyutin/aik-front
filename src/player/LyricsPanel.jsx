import PropTypes from 'prop-types'
import styles from './player.module.css'

const LyricsPanel = ({ lines }) => (
  <section className={styles.section} aria-labelledby="player-lyrics-heading">
    <header>
      <h2 id="player-lyrics-heading">Текст песни</h2>
      <p>Следите за ключевыми моментами композиции.</p>
    </header>
    <div className={styles.lyrics}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  </section>
)

LyricsPanel.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default LyricsPanel
