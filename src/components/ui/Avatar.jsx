// Initial-letter circle for a customer.

export function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-body font-semibold text-primary-strong"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
