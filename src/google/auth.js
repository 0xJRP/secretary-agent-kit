// Google OAuth — the owner approves specific scopes on Google's own screen,
// and we store the resulting token ON THIS MACHINE (tokens/ is gitignored).
// We never see it. Tokens auto-refresh.
import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { paths, load, save } from "../config.js";

const TOKENS_DIR = join(paths.ROOT, "tokens");
const TOKEN_PATH = join(TOKENS_DIR, "google.json");

// In plain English: see/manage calendar events, and send mail as the owner.
export const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

export function oauthClient(cfg = load()) {
  const { clientId, clientSecret, redirectUri } = cfg.google;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Where we send the owner to grant access.
export function authUrl(cfg = load()) {
  return oauthClient(cfg).generateAuthUrl({
    access_type: "offline", // get a refresh token
    prompt: "consent",
    scope: SCOPES,
  });
}

// Google redirects back with a ?code=...; trade it for tokens and remember.
export async function exchangeCode(code, cfg = load()) {
  const client = oauthClient(cfg);
  const { tokens } = await client.getToken(code);
  saveTokens(tokens);
  save({ google: { connected: true, scopesGranted: SCOPES } });
  return tokens;
}

export function saveTokens(tokens) {
  if (!existsSync(TOKENS_DIR)) mkdirSync(TOKENS_DIR, { recursive: true });
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2) + "\n");
}

export function loadTokens() {
  if (!existsSync(TOKEN_PATH)) return null;
  return JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
}

// An authenticated client the Calendar/Gmail tools can use.
export function authedClient(cfg = load()) {
  const tokens = loadTokens();
  if (!tokens) throw new Error("Google isn't connected yet — run `npm run setup`.");
  const client = oauthClient(cfg);
  client.setCredentials(tokens);
  // Persist refreshed access tokens as they rotate.
  client.on("tokens", (t) => saveTokens({ ...tokens, ...t }));
  return client;
}
