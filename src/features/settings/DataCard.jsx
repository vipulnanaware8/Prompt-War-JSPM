// Data: reset demo data with a confirm dialog (FR-SET-4), export as JSON (FR-SET-5).
import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { createSeedState } from '../../data/seed.js';
import { dayKey } from '../../lib/format.js';
import { useShop, useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

export function DataCard() {
  const t = useStrings();
  const state = useShop();
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const s = t.settingsScreen;

  function reset() {
    dispatch({ type: 'RESET', payload: createSeedState(new Date()) });
    setConfirming(false);
    showToast({ type: 'success', message: s.resetDone });
  }

  // Download the whole state as a file. Nothing leaves the device.
  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bol-ke-hisaab-${dayKey(new Date())}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast({ type: 'success', message: s.exportDone });
  }

  return (
    <Card title={s.dataCard}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={exportJson}>
          <Download size={20} aria-hidden="true" />
          {s.exportJson}
        </Button>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          <RotateCcw size={20} aria-hidden="true" />
          {s.reset}
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title={s.resetTitle}
        body={s.resetBody}
        confirmLabel={s.resetConfirm}
        cancelLabel={s.cancel}
        onConfirm={reset}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  );
}
