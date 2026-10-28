// The app at "/app" with its providers, as one lazily loaded chunk (see main.jsx).
import { App } from './App.jsx';
import { AppProviders } from './AppProviders.jsx';

export default function AppRoot() {
  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
}
