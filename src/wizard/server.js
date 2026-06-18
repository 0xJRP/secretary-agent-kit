// The visual setup wizard. Run `npm run setup`, open http://localhost:4322,
// and walk through connecting your secretary — button by button, with a plain-
// English explanation of what's happening at every step.
//
// This server stays deliberately tiny (no framework) so a curious owner can
// read it. It serves one page and a handful of JSON endpoints.
import { createServer } from "node:http";
import { load, save, readiness } from "../config.js";
import { renderPage } from "./page.js";
import { planFromInstruction } from "../agent/plan-preview.js";

const PORT = 4322;

// Never ship real secrets back to the browser — mask them. The wizard only
// needs to know whether something is filled in, not what it is.
function publicState() {
  const cfg = load();
  return {
    channel: cfg.channel,
    confirmBeforeSend: cfg.confirmBeforeSend,
    telegram: { botUsername: cfg.telegram.botUsername, hasToken: !!cfg.telegram.botToken },
    claude: { model: cfg.claude.model, hasKey: !!cfg.claude.apiKey },
    google: {
      connected: cfg.google.connected,
      hasCreds: !!cfg.google.clientId && !!cfg.google.clientSecret,
      scopesGranted: cfg.google.scopesGranted,
    },
    progress: cfg.progress,
    readiness: readiness(cfg),
  };
}

async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

function json(res, code, body) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // The page itself.
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(renderPage());
    return;
  }

  // Current state (masked) for the wizard to render progress.
  if (req.method === "GET" && url.pathname === "/api/state") {
    return json(res, 200, publicState());
  }

  // Save a chunk of config — a token, a key, creds, a toggle, step progress.
  if (req.method === "POST" && url.pathname === "/api/save") {
    const patch = await readJson(req);
    save(patch);
    return json(res, 200, publicState());
  }

  // Dry-run: show what the secretary *would* do with an instruction, without
  // sending anything. This is the "confirm before send" idea made visible.
  if (req.method === "POST" && url.pathname === "/api/preview") {
    const { instruction } = await readJson(req);
    return json(res, 200, { plan: planFromInstruction(String(instruction || "")) });
  }

  // Google OAuth callback lands here once that step is wired to real creds.
  // For now it explains itself so the visual flow is complete end to end.
  if (req.method === "GET" && url.pathname === "/oauth/callback") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(
      `<!doctype html><meta charset=utf-8><title>Google connected</title>
       <body style="font-family:system-ui;max-width:32rem;margin:4rem auto;line-height:1.6">
       <h2>👋 This is where Google sends you back</h2>
       <p>Once your Google credentials are filled in, this page captures the
       approval and stores a token <em>on your computer</em> — never sent to us.
       You can close this tab and return to the setup wizard.</p>
       <p><a href="/">← Back to setup</a></p></body>`
    );
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`\n  🐇 Secretary Agent Kit — setup wizard`);
  console.log(`  Open  →  http://localhost:${PORT}\n`);
  console.log(`  Press Ctrl+C to stop.\n`);
});
