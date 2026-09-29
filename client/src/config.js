export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const WHATSAPP_CONCIERGE_NUMBER = (
  import.meta.env.VITE_WHATSAPP_CONCIERGE_NUMBER ||
  import.meta.env.VITE_FLOSET_WHATSAPP_NUMBER ||
  '919657954641'
).replace(/\D/g, '');
export const FLOSET_WHATSAPP_NUMBER = WHATSAPP_CONCIERGE_NUMBER;

export const DEMO_ACCOUNTS = {
  customer: { email: "customer@gmail.com", password: "customer123" },
  host: { email: "host@boutique.com", password: "host123" },
  admin: { email: "altraverse@floset.com", password: "Ronit@200518" },
};

/** Require login; optional demo auto-login when VITE_DEMO_MODE=true */
export async function ensureAuthenticated(
  user,
  login,
  { demoRole, onOpenAuth } = {},
) {
  if (user) return user;
  if (DEMO_MODE && demoRole && DEMO_ACCOUNTS[demoRole]) {
    return login(DEMO_ACCOUNTS[demoRole]);
  }
  if (onOpenAuth) onOpenAuth();
  throw new Error("Please sign in to continue");
}

/**
 * Builds an official WhatsApp Click-to-Chat URL for order confirmation notification.
 */
export function buildWhatsAppOrderConfirmationUrl(booking) {
  if (!booking) return `https://wa.me/${WHATSAPP_CONCIERGE_NUMBER}`;

  const cleanPhone = (WHATSAPP_CONCIERGE_NUMBER || '919667954641').replace(/[^0-9]/g, '');
  const customerName = booking.customerId?.name || booking.deliveryAddress?.name || 'Customer';
  const customerPhone = booking.customerId?.phone || booking.deliveryAddress?.phone || '';
  const outfitName = booking.productId?.name || 'Luxury Rental Outfit';
  const outfitCategory = booking.productId?.category || '';
  const duration = (booking.rentalDuration || '3_days').replace(/_/g, ' ');
  const startDate = booking.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const endDate = booking.endDate ? new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const totalAmount = booking.totalAmount ? `₹${booking.totalAmount.toLocaleString()}` : '';
  const deposit = booking.securityDeposit ? `₹${booking.securityDeposit.toLocaleString()}` : '';
  const address = [
    booking.deliveryAddress?.street,
    booking.deliveryAddress?.city,
    booking.deliveryAddress?.pincode
  ].filter(Boolean).join(', ');

  const message = [
    `*FLOSET RENTAL ORDER CONFIRMATION*`,
    `─────────────────────────────`,
    `*Booking ID:* #${booking.bookingId}`,
    `*Outfit:* ${outfitName} ${outfitCategory ? `(${outfitCategory})` : ''}`,
    `*Duration:* ${duration} (${startDate} to ${endDate})`,
    `*Total Paid:* ${totalAmount} (Security Deposit: ${deposit} HELD)`,
    `*Customer:* ${customerName} ${customerPhone ? `(${customerPhone})` : ''}`,
    address ? `*Delivery Address:* ${address}` : '',
    `─────────────────────────────`,
    `Hi FLOSET Concierge, I have confirmed my rental booking online! Please proceed with dry-clean prep and dispatch scheduling.`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds an instant WhatsApp inquiry / direct order URL for a specific product.
 */
export function buildWhatsAppQuickInquiryUrl({ product, size, duration, startDate, endDate, user } = {}) {
  if (!product) return `https://wa.me/${WHATSAPP_CONCIERGE_NUMBER}`;

  const cleanPhone = (WHATSAPP_CONCIERGE_NUMBER || '919667954641').replace(/[^0-9]/g, '');
  const customerName = user?.name || 'Customer';
  const customerPhone = user?.phone || '';
  const outfitName = product.name || 'Luxury Rental Outfit';
  const category = product.category || '';
  const durLabel = (duration || '3_days').replace(/_/g, ' ');

  const dateSnippet = (startDate && endDate) 
    ? `*Requested Dates:* ${startDate} to ${endDate}`
    : '';

  const message = [
    `*FLOSET INSTANT OUTFIT ORDER INQUIRY*`,
    `─────────────────────────────`,
    `*Outfit:* ${outfitName} ${category ? `(${category})` : ''}`,
    `*Product Code:* #${product.productId || product._id || ''}`,
    size ? `*Requested Size:* ${size}` : '',
    `*Duration:* ${durLabel}`,
    dateSnippet,
    `*Customer:* ${customerName} ${customerPhone ? `(${customerPhone})` : ''}`,
    `─────────────────────────────`,
    `Hi FLOSET Concierge, I want to rent this outfit! Please verify express availability and dispatch slots.`
  ].filter(Boolean).join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}


