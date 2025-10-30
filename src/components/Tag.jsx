import React from 'react';

const variantClassName = {
  neutral: 'tag tag--neutral',
  success: 'tag tag--success',
  warning: 'tag tag--warning',
  danger: 'tag tag--danger',
};

const Tag = ({ variant = 'neutral', className = '', ...props }) => {
  const baseClass = variantClassName[variant] ?? variantClassName.neutral;
  const classes = [baseClass];

  if (className) {
    classes.push(className);
  }

  return <span className={classes.join(' ')} {...props} />;
};

export default Tag;
