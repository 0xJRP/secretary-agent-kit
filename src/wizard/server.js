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

function esc(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
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

  // Hand the browser the Google approval URL to redirect to. Lazy-import the
  // Google module so the wizard still runs before `npm install`.
  if (req.method === "GET" && url.pathname === "/api/google/auth-url") {
    const cfg = load();
    if (!cfg.google.clientId || !cfg.google.clientSecret) {
      return json(res, 400, { error: "Save your Google Client ID and secret first." });
    }
    try {
      const { authUrl } = await import("../google/auth.js");
      return json(res, 200, { url: authUrl(cfg) });
    } catch {
      return json(res, 500, { error: "Run `npm install` first, then try Connect again." });
    }
  }

  // Google redirects the owner back here with ?code=... — trade it for a token
  // and store it on this machine. Never sent to us.
  if (req.method === "GET" && url.pathname === "/oauth/callback") {
    const code = url.searchParams.get("code");
    let ok = false;
    let msg = "";
    if (code) {
      try {
        const { exchangeCode } = await import("../google/auth.js");
        await exchangeCode(code);
        ok = true;
      } catch (err) {
        msg = err.message;
      }
    } else {
      msg = "No authorization code came back from Google.";
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(
      `<!doctype html><meta charset=utf-8><title>Google ${ok ? "connected" : "error"}</title>
       <body style="font-family:system-ui;max-width:32rem;margin:4rem auto;line-height:1.6">
       <h2>${ok ? "✅ Google connected" : "⚠️ Couldn't connect Google"}</h2>
       <p>${ok
        ? "Your token is stored on your computer (in <code>tokens/</code>, gitignored) — never sent to us. Close this tab and head back to setup."
        : "Something went wrong: <code>" + esc(msg) + "</code>"}</p>
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
