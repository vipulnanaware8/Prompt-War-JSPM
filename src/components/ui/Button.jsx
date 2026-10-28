// Button — SRS 7.4. Variants: primary, secondary, ghost, danger. Sizes: md (44 px), lg (56 px).

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-strong',
  secondary: 'border border-border bg-surface text-ink hover:bg-bg',
  ghost: 'text-ink hover:bg-primary-soft',
  danger: 'bg-danger text-white hover:opacity-90',
};

const SIZES = {
  md: 'min-h-11 px-4 text-small font-semibold',
  lg: 'min-h-14 px-6 text-body font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md transition duration-150 ease-out active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
