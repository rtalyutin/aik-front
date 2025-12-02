import React from 'react';
import config from './config.js';
import styles from './AiKaraokePage.module.css';

const AiKaraokePage = () => {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{config.title}</h1>
      <p className={styles.description}>{config.description}</p>
    </section>
  );
};

export default AiKaraokePage;
