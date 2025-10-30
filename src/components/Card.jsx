import React from 'react';

const paddingClassName = {
  sm: 'card card--padding-sm',
  md: 'card card--padding-md',
  lg: 'card card--padding-lg',
};

const Card = ({ as: Component = 'div', padding = 'md', className = '', ...props }) => {
  const baseClass = paddingClassName[padding] ?? paddingClassName.md;
  const classes = [baseClass];

  if (className) {
    classes.push(className);
  }

  const Element = Component;

  return <Element className={classes.join(' ')} {...props} />;
};

export default Card;
