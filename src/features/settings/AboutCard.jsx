// About: privacy note (SRS 7.8) and version (FR-SET-6).
import { ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card.jsx';
import { useStrings } from '../../store/ShopContext.jsx';
import { version } from '../../../package.json';

export function AboutCard() {
  const t = useStrings();
  return (
    <Card title={t.settingsScreen.aboutCard}>
      <div className="flex flex-col gap-2">
        <p className="flex items-start gap-2 text-body">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          {t.settingsScreen.privacy}
        </p>
        <p className="text-small text-muted">
          {t.appName} · {t.settingsScreen.version(version)}
        </p>
      </div>
    </Card>
  );
}
