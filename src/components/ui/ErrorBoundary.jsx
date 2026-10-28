// Global error boundary (FR-SYS-4): a friendly screen with a Reload button instead of a blank page.
// It sits outside the shop provider, so it uses the default (Hinglish) strings.

import { Component } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import { STRINGS } from '../../i18n/strings.js';
import { Button } from './Button.jsx';

const t = STRINGS.hinglish;

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error(error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <TriangleAlert size={48} className="text-danger" aria-hidden="true" />
        <h1 className="text-h1 font-bold">{t.errorTitle}</h1>
        <p className="text-body text-muted">{t.errorHint}</p>
        <Button size="lg" onClick={() => window.location.reload()}>
          <RotateCcw size={20} aria-hidden="true" />
          {t.reload}
        </Button>
      </main>
    );
  }
}
