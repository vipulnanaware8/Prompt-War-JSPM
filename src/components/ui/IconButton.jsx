// Icon-only button — always needs an aria-label (SRS 7.4, NFR-9). 44 × 44 px touch target.

const VARIANTS = {
  ghost: 'text-muted hover:bg-primary-soft hover:text-primary-strong',
  filled: 'bg-primary text-white hover:bg-primary-strong',
};

export function IconButton({ label, variant = 'ghost', className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-[transform,opacity] duration-150 ease-out active:scale-[.98] ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
