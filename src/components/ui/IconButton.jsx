import clsx from 'clsx';

export default function IconButton({
  children,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}) {
  return (
    <button
      type="button"
      className={clsx('icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
