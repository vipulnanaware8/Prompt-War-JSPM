// ConfirmDialog (danger) — asks before something that cannot be undone (SRS 7.4).
import { TriangleAlert } from 'lucide-react';
import { Button } from './Button.jsx';
import { Sheet } from './Sheet.jsx';

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  return (
    <Sheet open={open} onClose={onCancel} label={title}>
      <div className="flex flex-col gap-4 px-4 pt-2 pb-6 sm:px-6 sm:pt-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <TriangleAlert size={24} aria-hidden="true" />
        </span>
        <h2 className="text-h2 font-semibold">{title}</h2>
        <p className="text-body text-muted">{body}</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {/* Cancel comes first in the tab order, so Enter on open does not destroy data */}
          <Button variant="secondary" size="lg" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="lg" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
