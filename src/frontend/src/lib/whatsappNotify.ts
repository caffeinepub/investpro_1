/**
 * WhatsApp notification via wa.me link.
 * Opens WhatsApp with a pre-filled message to the admin number.
 * User taps Send once to deliver the message — no API key required.
 */
const WA_PHONE = "919813983483";

export function notifyWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WA_PHONE}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
