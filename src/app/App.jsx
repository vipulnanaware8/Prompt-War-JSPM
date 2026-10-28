// App layout (SRS 7.3): sidebar + content + voice panel on desktop, tab bar on mobile.
// Sections are a simple state value — no router (SRS 10.3).
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { Header } from './Header.jsx';
import { Sidebar } from './Sidebar.jsx';
import { TabBar } from './TabBar.jsx';
import { VoicePanel } from '../features/voice/VoicePanel.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { KhataPage } from '../pages/KhataPage.jsx';
import { StockPage } from '../pages/StockPage.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { useStorageAvailable, useStrings } from '../store/ShopContext.jsx';

const PAGES = { home: HomePage, khata: KhataPage, stock: StockPage, settings: SettingsPage };

export function App() {
  const [section, setSection] = useState('home');
  const storageAvailable = useStorageAvailable();
  const t = useStrings();
  const Page = PAGES[section];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)_380px]">
      <Sidebar section={section} onNavigate={setSection} />

      <div className="min-w-0">
        {!storageAvailable && (
          <p className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-small font-medium text-warning">
            <CloudOff size={20} aria-hidden="true" />
            {t.storageBanner}
          </p>
        )}
        <div className="mx-auto max-w-[720px] px-4 pb-[calc(88px+env(safe-area-inset-bottom))] sm:px-6 lg:max-w-[760px] lg:px-8 lg:pb-12">
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
                <Page onNavigate={setSection} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <VoicePanel />
      <TabBar section={section} onNavigate={setSection} />
    </div>
  );
}
