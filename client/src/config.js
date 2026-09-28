export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export const FLOSET_WHATSAPP_NUMBER = (
  import.meta.env.VITE_FLOSET_WHATSAPP_NUMBER || "919022447764"
).replace(/\D/g, "");
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

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
