// Firebase connection for Telegram alerts. Loaded lazily, and only when the owner turns alerts
// on, so the khata itself stays offline-first and never needs an account. Each phone signs in
// anonymously; its shop summary lives at shops/{uid}.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** The alert bot's username without "@", e.g. "BolKeHisaabBot". */
export const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? '';

/** False until the deployer fills in .env.local (see docs/TELEGRAM_ALERTS.md). */
export const cloudConfigured = Boolean(
  config.apiKey && config.projectId && config.appId && BOT_USERNAME,
);

let ready = null;

function connect() {
  ready ??= (async () => {
    const [{ initializeApp }, auth, fs] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const app = initializeApp(config);
    const { user } = await auth.signInAnonymously(auth.getAuth(app));
    return { uid: user.uid, db: fs.getFirestore(app), fs };
  })().catch((error) => {
    ready = null; // let the next call try again (e.g. offline)
    throw error;
  });
  return ready;
}

/** Upload the shop summary built by buildAlertSnapshot(). */
export async function pushSnapshot(snapshot) {
  const { uid, db, fs } = await connect();
  await fs.setDoc(fs.doc(db, 'shops', uid), snapshot);
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I mix-ups

function randomCode(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

/** One-time code for the owner (6 characters) or a customer invite ("C" + 7). */
export const newConnectCode = () => randomCode(6);
export const newInviteCode = () => `C${randomCode(7)}`;

/** t.me link that opens the bot; tapping Start sends "/start <code>" to the webhook. */
export function botLink(code) {
  return `https://t.me/${BOT_USERNAME}?start=${code}`;
}

/** Save the owner's code so the webhook can match it to this shop. */
export async function registerConnectCode(code) {
  const { uid, db, fs } = await connect();
  await fs.setDoc(fs.doc(db, 'connectCodes', code), { uid, createdAt: fs.serverTimestamp() });
}

/** Save a customer's invite code (valid 7 days). */
export async function registerInviteCode(code, customerId) {
  const { uid, db, fs } = await connect();
  await fs.setDoc(fs.doc(db, 'inviteCodes', code), {
    uid,
    customerId,
    createdAt: fs.serverTimestamp(),
  });
}

/**
 * Follow the owner's link status. Calls back with { chatId, name, connectedAt } or null.
 * @returns {Promise<() => void>} unsubscribe
 */
export async function watchConnection(onChange) {
  const { uid, db, fs } = await connect();
  return fs.onSnapshot(fs.doc(db, 'connections', uid), (snap) =>
    onChange(snap.exists() ? snap.data() : null),
  );
}

/** Unlink Telegram and delete the uploaded summary. */
export async function disconnectAlerts() {
  const { uid, db, fs } = await connect();
  await Promise.all([
    fs.deleteDoc(fs.doc(db, 'connections', uid)),
    fs.deleteDoc(fs.doc(db, 'shops', uid)),
  ]);
}
