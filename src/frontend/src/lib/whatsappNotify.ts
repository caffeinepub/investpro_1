/**
 * WhatsApp notification via wa.me link.
 * Opens WhatsApp with a pre-filled message to the specified number.
 */

// Deposit notifications go to this number
const DEPOSIT_WA_PHONE = "919518089878";

// Withdrawal notifications go to this number
const WITHDRAW_WA_PHONE = "919671870287";

export function notifyWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${DEPOSIT_WA_PHONE}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function notifyWithdrawWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WITHDRAW_WA_PHONE}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
