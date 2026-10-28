// Data: reset demo data with a confirm dialog (FR-SET-4), export as JSON (FR-SET-5),
// download a month's hisaab as an Excel sheet.
import { useState } from 'react';
import { Download, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { createSeedState } from '../../data/seed.js';
import { dayKey } from '../../lib/format.js';
import { buildMonthSheets, monthKey } from '../../lib/monthReport.js';
import { buildXlsx } from '../../lib/xlsx.js';
import { useShop, useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

export function DataCard() {
  const t = useStrings();
  const state = useShop();
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const s = t.settingsScreen;

  function reset() {
    dispatch({ type: 'RESET', payload: createSeedState(new Date()) });
    setConfirming(false);
    showToast({ type: 'success', message: s.resetDone });
  }

  // Save a file on the device. Nothing leaves the device.
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast({ type: 'success', message: s.exportDone });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    download(blob, `bol-ke-hisaab-${dayKey(new Date())}.json`);
  }

  // Month hisaab as an Excel workbook: Summary, Daily, Transactions, Khata.
  function exportExcel() {
    const bytes = buildXlsx(buildMonthSheets(state, month));
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    download(blob, `hisaab-${month}.xlsx`);
  }

  return (
    <Card title={s.dataCard}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-small font-medium text-muted">
          {s.monthLabel}
          <input
            type="month"
            value={month}
            max={monthKey(new Date())}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-3 text-body text-ink"
          />
        </label>
        <Button onClick={exportExcel}>
          <FileSpreadsheet size={20} aria-hidden="true" />
          {s.exportExcel}
        </Button>
      </div>
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
