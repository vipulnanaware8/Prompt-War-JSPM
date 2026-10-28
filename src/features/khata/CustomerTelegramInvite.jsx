// Invite a customer to free udhaar reminders on Telegram. The owner shares a one-time bot link
// (via WhatsApp share, which they send themselves); the customer tapping Start is their consent,
// and /stop ends it. No phone number is stored.
import { Send } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { botLink, newInviteCode, registerInviteCode } from '../../lib/cloud.js';
import { useShop, useShopDispatch, useStrings } from '../../store/ShopContext.jsx';

export function CustomerTelegramInvite({ customer }) {
  const t = useStrings();
  const dispatch = useShopDispatch();
  const { showToast } = useToast();
  const shopName = useShop((s) => s.settings.shopName);

  function invite() {
    // Open the share first, inside the tap, so the browser does not block the new tab.
    const code = newInviteCode();
    const text = t.alerts.inviteMessage(customer.name, shopName, botLink(code));
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    dispatch({
      type: 'UPDATE_CUSTOMER',
      payload: { id: customer.id, changes: { telegramInvited: true } },
    });
    registerInviteCode(code, customer.id).catch(() =>
      showToast({ type: 'error', message: t.alerts.failed }),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" onClick={invite} className="self-start">
        <Send size={20} aria-hidden="true" />
        {customer.telegramInvited ? t.alerts.inviteAgain : t.alerts.invite}
      </Button>
      <p className="text-caption text-muted">{t.alerts.inviteHelp}</p>
    </div>
  );
}
