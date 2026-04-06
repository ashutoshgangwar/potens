import React from 'react';

/**
 * Card component with optional header, footer, and padding variants.
 */
const Card = ({
  children,
  header = null,
  footer = null,
  padding = 'md',
  shadow = 'md',
  className = '',
  ...rest
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  return (
    <div
      className={[
        'bg-white rounded-2xl border border-gray-100',
        shadows[shadow],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-100">{header}</div>
      )}
      <div className={paddings[padding]}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
