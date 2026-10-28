// App layout (SRS 7.3): sidebar + content + voice panel on desktop, tab bar on mobile.
// Sections are a simple state value — no router (SRS 10.3).
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import { TabBar } from './TabBar.jsx';
import { Sheet } from '../components/ui/Sheet.jsx';
import { VoicePanel } from '../features/voice/VoicePanel.jsx';
import { ConfirmationSheet } from '../features/commands/ConfirmationSheet.jsx';
import { useCommandFlow } from '../features/commands/useCommandFlow.js';
import { CustomerSheet } from '../features/khata/CustomerSheet.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { KhataPage } from '../pages/KhataPage.jsx';
import { StockPage } from '../pages/StockPage.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { useStorageAvailable, useStrings } from '../store/ShopContext.jsx';

const PAGES = { home: HomePage, khata: KhataPage, stock: StockPage, settings: SettingsPage };
const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];

export function App() {
  const [section, setSection] = useState('home');
  const [params, setParams] = useState(null); // e.g. { filter: 'low' } for Stock
  const [customerSheet, setCustomerSheet] = useState({ id: null, open: false });
  const storageAvailable = useStorageAvailable();
  const t = useStrings();
  const flow = useCommandFlow();
  const Page = PAGES[section];
  const { toggle: toggleMic } = flow.mic;
  const cardOpen = flow.draft !== null;

  function navigate(id, options = null) {
    setParams(options);
    setSection(id);
  }

  // Customer sheet opens from Khata, the dashboard and answers (FR-KHATA-2).
  function openCustomer(id) {
    if (flow.voiceOpen) flow.closeVoice();
    setCustomerSheet({ id, open: true });
  }

  // Space toggles the mic when focus is not in a control (NFR-8).
  useEffect(() => {
    function onKeyDown(event) {
      if (event.code !== 'Space' || cardOpen || TYPING_TAGS.includes(event.target.tagName)) return;
      event.preventDefault();
      toggleMic();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleMic, cardOpen]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)_380px]">
      <Sidebar section={section} onNavigate={navigate} />

      <div className="min-w-0">
        {!storageAvailable && (
          <p className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-small font-medium text-warning">
            <CloudOff size={20} aria-hidden="true" />
            {t.storageBanner}
          </p>
        )}
        <div className="mx-auto max-w-[720px] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] sm:px-6 lg:max-w-[760px] lg:px-8 lg:pb-12">
          <Header />
          <main>
            {/* 200 ms fade/slide between sections (FR-NAV-5); only fades under reduced motion */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Page onNavigate={navigate} onOpenCustomer={openCustomer} params={params} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Desktop: sticky dark voice panel, visible on every section (FR-NAV-3) */}
      <aside
        aria-label={t.voice.panel}
        className="sticky top-0 hidden h-dvh overflow-y-auto bg-ink text-panel-text lg:block"
      >
        <VoicePanel flow={flow} onOpenCustomer={openCustomer} />
      </aside>

      {/* Mobile: the same panel as a full-height sheet from the mic button */}
      <Sheet open={flow.voiceOpen} onClose={flow.closeVoice} label={t.voice.panel} dark full>
        <VoicePanel flow={flow} onOpenCustomer={openCustomer} />
      </Sheet>

      <ConfirmationSheet flow={flow} />
      <CustomerSheet
        customerId={customerSheet.id}
        open={customerSheet.open}
        onClose={() => setCustomerSheet((s) => ({ ...s, open: false }))}
      />
      <TabBar section={section} onNavigate={navigate} onMic={flow.openVoice} />
    </div>
  );
}
