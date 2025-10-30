import React from 'react';

const variantClassName = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
};

const Button = React.forwardRef(
  ({ variant = 'primary', fullWidth = false, icon, children, className = '', ...props }, ref) => {
    const baseClass = variantClassName[variant] ?? variantClassName.primary;
    const classes = [baseClass];

    if (fullWidth) {
      classes.push('btn--full-width');
    }

    if (className) {
      classes.push(className);
    }

    return (
      <button ref={ref} className={classes.join(' ')} {...props}>
        {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
        {children && <span className="btn__label">{children}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
