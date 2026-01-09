import React, { useState } from 'react';
import styles from './Accordion.module.css';

const Accordion = ({ title, children, defaultOpen = true, className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${styles.accordion} ${className}`} {...props}>
      <button
        type="button"
        className={styles.accordionHeader}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className={styles.accordionTitle}>{title}</h3>
        <svg
          className={`${styles.accordionArrow} ${isOpen ? styles.accordionArrowOpen : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
};

export default Accordion;
