import React from 'react';
import config from './config.js';
import styles from './Aik2Page.module.css';

const Aik2Page = () => {
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{config.title}</h1>
        <p className={styles.description}>{config.description}</p>
      </div>
    </section>
  );
};

export default Aik2Page;
