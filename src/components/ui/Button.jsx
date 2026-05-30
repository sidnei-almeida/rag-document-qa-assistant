import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
