// Tiny config store for the kit. Writes a plain-English config.json next to the
// project root. Secrets live here (and in .env); both are gitignored.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = join(ROOT, "config.json");

const DEFAULTS = {
  // Which messenger the secretary lives on. Telegram first; the adapter
  // interface lets WhatsApp/others drop in later (see PLAN.md).
  channel: "telegram",
  telegram: { botToken: "", botUsername: "", ownerChatId: "" },
  claude: { apiKey: "", model: "claude-opus-4-8" },
  google: {
    clientId: "",
    clientSecret: "",
    redirectUri: "http://localhost:4322/oauth/callback",
    // Filled in after the owner connects their Google account.
    connected: false,
    scopesGranted: [],
  },
  // The secretary drafts and asks before sending/booking until you trust it.
  confirmBeforeSend: true,
  // Tracks which wizard steps the owner has completed, so the UI can resume.
  progress: {},
};

export function load() {
  if (!existsSync(CONFIG_PATH)) return structuredClone(DEFAULTS);
  try {
    const saved = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
    return deepMerge(structuredClone(DEFAULTS), saved);
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function save(patch) {
  const next = deepMerge(load(), patch);
  writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n");
  return next;
}

// What's missing before the secretary can run, in plain English.
export function readiness(cfg = load()) {
  return [
    { key: "telegram", label: "Telegram bot connected", ok: !!cfg.telegram.botToken },
    { key: "claude", label: "Claude brain connected", ok: !!cfg.claude.apiKey },
    { key: "google", label: "Google account connected", ok: !!cfg.google.connected },
  ];
}

function deepMerge(base, patch) {
  for (const [k, v] of Object.entries(patch || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      base[k] = deepMerge(base[k] && typeof base[k] === "object" ? base[k] : {}, v);
    } else {
      base[k] = v;
    }
  }
  return base;
}

export const paths = { ROOT, CONFIG_PATH };
