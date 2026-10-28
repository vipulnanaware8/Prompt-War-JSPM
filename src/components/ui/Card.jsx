// Card — SRS 7.4. `onClick` makes it interactive (a real button with hover lift).

const BASE = 'paper rounded-lg border border-border bg-surface p-4 shadow-card sm:p-6';

export function Card({ title, action, onClick, className = '', children, ...props }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${BASE} block w-full text-left transition-[transform,opacity] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-raised ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  return (
    <section className={`${BASE} ${className}`} {...props}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-h2 font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
