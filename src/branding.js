// ─────────────────────────────────────────────────────────────────────────
// Rabbithole funnel + branding — the SHARED module every kit in the 30-day
// series drops in. Keep this identical across kits (only KIT changes), so the
// branding, CTAs, and lead attribution stay consistent everywhere.
//
// The whole point: each free kit is the top of a funnel. Someone runs it, loves
// it, and every link points back to Rabbithole — UTM-tagged so we know which
// kit converted them.
// ─────────────────────────────────────────────────────────────────────────

export const RABBITHOLE = {
  name: "Rabbithole",
  fullName: "Rabbithole Consulting",
  site: "https://rabbithole.consulting",
  bookPath: "/#book", // where "book a call" points
  blue: "#1763f0",
  blueDark: "#0b3aa8",
  promise: "We build custom AI infrastructure for businesses — end to end.",
};

export const SERIES = {
  name: "30 Days of AI Kits",
  campaign: "30-day-series",
  day: 2,
  total: 30,
};

// The only block that changes per kit.
export const KIT = {
  slug: "secretary-agent-kit",
  title: "Secretary Agent Kit",
  oneLiner: "Your AI secretary, on any messenger.",
};

// Build a UTM-tagged link back to Rabbithole so every lead is attributable to
// the exact kit (and the exact spot in the UI) it came from.
export function link(path = "", { medium = "kit", content } = {}) {
  const url = new URL(path || "/", RABBITHOLE.site);
  url.searchParams.set("utm_source", KIT.slug);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", SERIES.campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

export function bookLink(content) {
  return link(RABBITHOLE.bookPath, { medium: "cta", content });
}

// The recurring "we'll build the real thing for you" call to action.
export const CTA = {
  headline: "Want this connected to your real tools — for your whole team?",
  sub: "This kit is the DIY taste. We build the production version end to end: real bookings, your CRM, your inbox, guardrails, the works.",
  button: "Book a call with Rabbithole →",
};

// One-line footer line reused across the kit and README.
export function footerLine() {
  return `Built by ${RABBITHOLE.name} — ${RABBITHOLE.promise}  ·  Day ${SERIES.day} of ${SERIES.total}`;
}
