// The setup wizard page — one self-contained HTML document.
// Plain English, button-by-button, with a "what's happening" panel at every
// connection point. Two tracks: build it yourself, or do it inside Claude.
import { RABBITHOLE, SERIES, link, bookLink, CTA } from "../branding.js";

// The recurring "we'll build the real thing for you" funnel card.
function ctaCard(spot) {
  return `<div class="card cta-card">
    <h3>${CTA.headline}</h3>
    <p>${CTA.sub}</p>
    <a class="cta-btn" href="${bookLink(spot)}" target="_blank">${CTA.button}</a>
  </div>`;
}

export function renderPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>🐇 Secretary Agent Kit — Setup</title>
<style>
  :root {
    --ink: #1a1c2c; --muted: #5b6173; --line: #e4e6ef; --bg: #f7f8fc;
    --card: #ffffff; --brand: #1763f0; --brand-dark: #0b3aa8; --brand-soft: #e7efff;
    --go: #0ea05a; --go-soft: #e6f6ee; --warn: #b45309; --warn-soft: #fdf2e3;
    --send: #c2410c; --send-soft: #fdeee6;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  a { color: var(--brand); }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 24px; }
  .brandbar { background: linear-gradient(90deg, var(--brand-dark), var(--brand));
    color: #fff; border-radius: 0 0 18px 18px; }
  .brandbar .inner { max-width: 1040px; margin: 0 auto; padding: 14px 24px;
    display: flex; align-items: center; gap: 11px; }
  .brandbar .logo { width: 34px; height: 34px; border-radius: 9px; flex: none;
    background: rgba(255,255,255,.16); display: grid; place-items: center; font-size: 19px; }
  .brandbar .name { font-size: 18px; font-weight: 800; letter-spacing: .3px; }
  .brandbar .name span { font-weight: 500; opacity: .85; }
  .brandbar a { margin-left: auto; color: #fff; text-decoration: none; font-weight: 600;
    font-size: 14px; background: rgba(255,255,255,.18); padding: 7px 14px; border-radius: 999px; }
  header.top { padding: 8px 0 20px; border-bottom: 1px solid var(--line); margin-bottom: 24px; }
  header.top h1 { font-size: 26px; margin: 0; color: var(--brand-dark); }
  header.top p { margin: 4px 0 0; color: var(--muted); }
  .layout { display: grid; grid-template-columns: 1fr 280px; gap: 28px; align-items: start; }
  @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }

  .tracks { display: flex; gap: 10px; margin-bottom: 22px; }
  .track-btn { flex: 1; text-align: left; cursor: pointer; background: var(--card);
    border: 1.5px solid var(--line); border-radius: 14px; padding: 14px 16px; }
  .track-btn.active { border-color: var(--brand); background: var(--brand-soft); }
  .track-btn b { display: block; }
  .track-btn span { color: var(--muted); font-size: 14px; }

  .card { background: var(--card); border: 1px solid var(--line); border-radius: 16px;
    padding: 22px; margin-bottom: 18px; }
  .step-head { display: flex; align-items: center; gap: 12px; }
  .num { width: 30px; height: 30px; flex: none; border-radius: 50%; background: var(--brand);
    color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 15px; }
  .num.done { background: var(--go); }
  .step-head h3 { margin: 0; font-size: 19px; }
  .step-body { margin-top: 14px; }

  .why { background: var(--brand-soft); border-radius: 12px; padding: 12px 14px;
    margin: 14px 0; font-size: 14.5px; }
  .why b { color: var(--brand); }
  .safe { background: var(--go-soft); border-radius: 12px; padding: 12px 14px;
    margin: 14px 0; font-size: 14.5px; }
  .safe b { color: var(--go); }

  ol.btns { margin: 12px 0; padding-left: 0; list-style: none; counter-reset: s; }
  ol.btns li { counter-increment: s; position: relative; padding: 6px 0 6px 34px; }
  ol.btns li::before { content: counter(s); position: absolute; left: 0; top: 6px;
    width: 22px; height: 22px; border-radius: 6px; background: var(--line);
    display: grid; place-items: center; font-size: 13px; font-weight: 700; color: var(--muted); }
  kbd { background: #2b2d42; color: #fff; border-radius: 6px; padding: 2px 7px;
    font: 13px ui-monospace, Menlo, monospace; }
  code { background: #f0f1f7; border-radius: 6px; padding: 2px 6px;
    font: 13.5px ui-monospace, Menlo, monospace; }
  pre { background: #1f2233; color: #e8eaf6; border-radius: 12px; padding: 14px 16px;
    overflow: auto; font: 13px ui-monospace, Menlo, monospace; }

  label.field { display: block; margin: 12px 0 4px; font-weight: 600; font-size: 14px; }
  input[type=text], input[type=password], textarea {
    width: 100%; border: 1.5px solid var(--line); border-radius: 10px; padding: 10px 12px;
    font: inherit; font-size: 15px; }
  textarea { resize: vertical; min-height: 70px; }
  .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  button.go { background: var(--brand); color: #fff; border: 0; border-radius: 10px;
    padding: 10px 18px; font: inherit; font-weight: 600; cursor: pointer; }
  button.go.ghost { background: #fff; color: var(--brand); border: 1.5px solid var(--brand); }
  button.go:disabled { opacity: .5; cursor: default; }
  .ok-pill { color: var(--go); font-weight: 600; font-size: 14px; }

  header.top .brand { display: flex; align-items: center; gap: 8px; width: 100%;
    margin-bottom: 6px; }
  header.top .brand .logo { width: 26px; height: 26px; border-radius: 8px; flex: none;
    background: var(--brand); color: #fff; display: grid; place-items: center; font-size: 15px; }
  header.top .brand b { font-size: 15px; letter-spacing: .2px; }
  header.top .brand a { margin-left: auto; font-size: 13.5px; font-weight: 600;
    text-decoration: none; color: var(--brand); background: var(--brand-soft);
    padding: 5px 12px; border-radius: 999px; }
  footer.foot { margin-top: 28px; padding: 22px 0 8px; border-top: 1px solid var(--line);
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap; color: var(--muted);
    font-size: 14px; }
  footer.foot .logo { width: 22px; height: 22px; border-radius: 7px; flex: none;
    background: var(--brand); color: #fff; display: grid; place-items: center; font-size: 13px; }
  footer.foot a { font-weight: 600; }
  footer.foot .spacer { margin-left: auto; }

  aside.status { position: sticky; top: 24px; }
  aside .card { padding: 18px; }
  .check { display: flex; align-items: center; gap: 9px; padding: 7px 0; font-size: 14.5px; }
  .dot { width: 18px; height: 18px; border-radius: 50%; flex: none; border: 2px solid var(--line); }
  .dot.on { background: var(--go); border-color: var(--go); }

  .plan-step { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px dashed var(--line); }
  .tag { font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; flex: none;
    background: var(--brand-soft); color: var(--brand); height: fit-content; }
  .tag.send { background: var(--send-soft); color: var(--send); }
  .sends { margin-top: 12px; }
  .hidden { display: none; }
  .muted { color: var(--muted); }

  .cta-card { background: linear-gradient(120deg, var(--brand-dark), var(--brand));
    color: #fff; border: 0; }
  .cta-card h3 { margin: 0 0 6px; font-size: 19px; }
  .cta-card p { margin: 0 0 14px; opacity: .92; }
  .cta-btn { display: inline-block; background: #fff; color: var(--brand-dark);
    font-weight: 700; text-decoration: none; padding: 11px 18px; border-radius: 10px; }
</style>
</head>
<body>
<div class="brandbar">
  <div class="inner">
    <span class="logo">🐇</span>
    <span class="name">Rabbithole <span>Consulting</span></span>
    <a href="${link("", { medium: "brandbar" })}" target="_blank">rabbithole.consulting&nbsp;↗</a>
  </div>
</div>
<div class="wrap">
  <header class="top">
    <h1>Your AI Secretary</h1>
    <p>Set it up once — then text it like a personal assistant.</p>
  </header>

  <div class="layout">
    <main>
      <div class="tracks">
        <div class="track-btn active" data-track="build" onclick="switchTrack('build')">
          <b>🛠️ Build it yourself</b>
          <span>Run your own bot. You own everything. ~15 min.</span>
        </div>
        <div class="track-btn" data-track="claude" onclick="switchTrack('claude')">
          <b>⚡ Do it inside Claude</b>
          <span>No code. Use Claude's built-in connectors instead.</span>
        </div>
      </div>

      <!-- ================= TRACK A: BUILD IT ================= -->
      <section id="track-build">

        <div class="card">
          <div class="step-head"><div class="num" id="n1">1</div><h3>Give your secretary a phone — make a Telegram bot</h3></div>
          <div class="step-body">
            <div class="why"><b>What's happening:</b> A "bot" is just a Telegram account your
              program controls. You create it by chatting with Telegram's official robot,
              <b>BotFather</b>. He hands you a secret <b>token</b> — a password that lets your
              code send and read messages as that bot. Nothing is connected to your real
              Telegram account or contacts.</div>
            <ol class="btns">
              <li>Open Telegram and search for <kbd>@BotFather</kbd> (the one with the blue check).</li>
              <li>Tap <kbd>Start</kbd>, then send <kbd>/newbot</kbd>.</li>
              <li>He asks for a <b>name</b> (anything, e.g. "Maple Assistant").</li>
              <li>Then a <b>username</b> ending in <code>bot</code> (e.g. <code>maple_secretary_bot</code>).</li>
              <li>He replies with a line like <code>123456:ABC-DEF...</code> — that's your token. Copy it.</li>
            </ol>
            <label class="field">Paste your bot token</label>
            <input type="password" id="tgToken" placeholder="123456789:AAH...your-token">
            <label class="field">Bot username (optional, helps the test step)</label>
            <input type="text" id="tgUser" placeholder="maple_secretary_bot">
            <div class="row" style="margin-top:12px">
              <button class="go" onclick="saveTelegram()">Save bot</button>
              <span class="ok-pill hidden" id="tgOk">✓ Saved</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="step-head"><div class="num" id="n2">2</div><h3>Give it a brain — connect Claude</h3></div>
          <div class="step-body">
            <div class="why"><b>What's happening:</b> The bot can pass messages, but it needs a
              brain to <em>understand</em> "find a time next week and ask Sarah." That brain is
              <b>Claude</b>. Your code sends each request to Claude with a list of allowed
              actions (read calendar, send email…), and Claude decides which to use.</div>
            <ol class="btns">
              <li>Go to <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a> and sign in.</li>
              <li>Open <b>API Keys</b> → <kbd>Create Key</kbd>.</li>
              <li>Copy the key (starts with <code>sk-ant-</code>) and paste it below.</li>
            </ol>
            <label class="field">Claude API key</label>
            <input type="password" id="claudeKey" placeholder="sk-ant-...">
            <div class="row" style="margin-top:12px">
              <button class="go" onclick="saveClaude()">Save brain</button>
              <span class="muted" style="font-size:13.5px">Model: <code>claude-opus-4-8</code> (smartest). Change to <code>claude-sonnet-4-6</code> in <code>config.json</code> to save cost.</span>
              <span class="ok-pill hidden" id="claudeOk">✓ Saved</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="step-head"><div class="num" id="n3">3</div><h3>Give it your calendar &amp; email — connect Google</h3></div>
          <div class="step-body">
            <div class="why"><b>What's happening:</b> To act like a secretary it needs to read
              your <b>Calendar</b> and send <b>Gmail</b>. Google uses <b>OAuth</b> — you approve
              specific permissions ("scopes") on Google's own screen, and Google hands back a
              token stored <em>on your computer</em>. You can revoke it anytime in your Google
              account. We never see it.</div>
            <div class="safe"><b>Scopes you'll approve, in plain English:</b><br>
              • <b>See your calendar &amp; create events</b> — to find open times and book them.<br>
              • <b>Send email as you</b> — to reach the people you ask it to contact.</div>
            <ol class="btns">
              <li>Open <a href="https://console.cloud.google.com" target="_blank">console.cloud.google.com</a> → create a project (any name).</li>
              <li>Search <b>"Google Calendar API"</b> → <kbd>Enable</kbd>. Do the same for <b>"Gmail API"</b>.</li>
              <li>Go to <b>Credentials</b> → <kbd>Create Credentials</kbd> → <b>OAuth client ID</b> → type <b>Web application</b>.</li>
              <li>Under <b>Authorized redirect URIs</b> add exactly: <code>http://localhost:4322/oauth/callback</code></li>
              <li>Copy the <b>Client ID</b> and <b>Client secret</b> into the boxes below.</li>
            </ol>
            <label class="field">Client ID</label>
            <input type="text" id="gId" placeholder="...apps.googleusercontent.com">
            <label class="field">Client secret</label>
            <input type="password" id="gSecret" placeholder="GOCSPX-...">
            <div class="row" style="margin-top:12px">
              <button class="go" onclick="saveGoogle()">Save Google credentials</button>
              <button class="go ghost" onclick="connectGoogle()">Connect Google account →</button>
              <span class="ok-pill hidden" id="gOk">✓ Connected</span>
            </div>
            <p class="muted" style="font-size:13.5px;margin-bottom:0">The "Connect" button takes you to Google's approval screen, then back here. Your token is stored on your computer in <code>tokens/</code> (gitignored) — never sent to us. (Run <code>npm install</code> first so this step has what it needs.)</p>
          </div>
        </div>

        <div class="card">
          <div class="step-head"><div class="num">4</div><h3>Try it — without sending anything</h3></div>
          <div class="step-body">
            <div class="why"><b>What's happening:</b> Type an instruction the way you'd text it.
              The secretary shows you its <b>plan</b> — which actions it would take and who it
              would contact — <em>before</em> doing anything. This is the
              <b>confirm-before-send</b> safety: it drafts, you approve.</div>
            <label class="field">Tell your secretary what to do</label>
            <textarea id="instruction" placeholder="e.g. Ask Sarah (sarah@example.com) to grab 30 min next week — find a time that's open on my calendar and propose it."></textarea>
            <div class="row" style="margin-top:12px">
              <button class="go" onclick="preview()">Show me the plan</button>
              <span class="muted" style="font-size:13.5px">Nothing is sent — this is a dry run.</span>
            </div>
            <div id="planOut" class="hidden" style="margin-top:16px"></div>
          </div>
        </div>

        <div class="card">
          <div class="step-head"><div class="num">5</div><h3>Go live</h3></div>
          <div class="step-body">
            <p>When the checklist on the right is all green, start your secretary:</p>
            <pre>npm install
npm start</pre>
            <p>Then open Telegram, find your bot, tap <kbd>Start</kbd>, and text it like you
              would a real assistant. It'll reply there.</p>
          </div>
        </div>

        ${ctaCard("build-track-bottom")}
      </section>

      <!-- ================= TRACK B: INSIDE CLAUDE ================= -->
      <section id="track-claude" class="hidden">
        <div class="card">
          <div class="step-head"><div class="num">★</div><h3>The no-code way: connectors inside Claude</h3></div>
          <div class="step-body">
            <div class="why"><b>What's happening:</b> You don't have to run any of this yourself.
              The Claude app can connect to Google Calendar and Gmail directly through
              <b>connectors</b> (built on MCP — the same "safe translator" idea as our Day 1 kit).
              You get most of the secretary's power with zero code — the trade-off is it lives
              inside Claude rather than on Telegram.</div>
            <ol class="btns">
              <li>Open the <b>Claude</b> app (claude.ai or desktop) and sign in.</li>
              <li>Go to <b>Settings → Connectors</b>.</li>
              <li>Find <b>Google Calendar</b> → <kbd>Connect</kbd> → approve on Google's screen.</li>
              <li>Do the same for <b>Gmail</b>.</li>
              <li>Back in a chat, just ask: <em>"Find an open 30-min slot next week and draft an email to sarah@example.com proposing it."</em></li>
            </ol>
            <div class="safe"><b>Same safety, different place:</b> Claude shows you the draft email
              and the proposed event before anything is sent — you stay in control, exactly like
              the confirm-before-send step in the build-it track.</div>
            <p class="muted">Use this track when you want the result today and don't need a
              Telegram bot of your own. Use <b>Build it yourself</b> when you want to own it,
              run it on a messenger, or extend it.</p>
          </div>
        </div>

        ${ctaCard("claude-track-bottom")}
      </section>
    </main>

    <!-- ================= STATUS SIDEBAR ================= -->
    <aside class="status">
      <div class="card">
        <b>Readiness</b>
        <div id="checks" style="margin-top:8px"></div>
        <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
        <div class="muted" style="font-size:13px">Secrets are stored in <code>config.json</code>
          on your computer and are gitignored. Nothing is sent to us.</div>
      </div>
      <div class="card cta-card" style="padding:18px">
        <h3 style="font-size:16px">Want it done for you?</h3>
        <p style="font-size:14px">We connect your real calendar, inbox &amp; team — production-ready.</p>
        <a class="cta-btn" style="font-size:14px" href="${bookLink("sidebar")}" target="_blank">Book a call →</a>
      </div>
    </aside>
  </div>

  <footer class="foot">
    <span class="logo">🐇</span>
    <span>Built by <b>Rabbithole</b> — ${RABBITHOLE.promise}</span>
    <span class="spacer"></span>
    <span>Day ${SERIES.day} of ${SERIES.total} · <a href="${link("", { medium: "footer" })}" target="_blank">rabbithole.consulting</a></span>
  </footer>
</div>

<script>
const $ = (id) => document.getElementById(id);

async function api(path, body) {
  const opts = body
    ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
    : {};
  const r = await fetch(path, opts);
  return r.json();
}

function switchTrack(t) {
  document.querySelectorAll(".track-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.track === t));
  $("track-build").classList.toggle("hidden", t !== "build");
  $("track-claude").classList.toggle("hidden", t !== "claude");
}

async function saveTelegram() {
  await api("/api/save", { telegram: { botToken: $("tgToken").value.trim(), botUsername: $("tgUser").value.trim() } });
  $("tgOk").classList.remove("hidden");
  refresh();
}
async function saveClaude() {
  await api("/api/save", { claude: { apiKey: $("claudeKey").value.trim() } });
  $("claudeOk").classList.remove("hidden");
  refresh();
}
async function saveGoogle() {
  await api("/api/save", { google: { clientId: $("gId").value.trim(), clientSecret: $("gSecret").value.trim() } });
  refresh();
}
async function connectGoogle() {
  await saveGoogle(); // make sure creds are saved first
  const r = await api("/api/google/auth-url");
  if (r.url) { window.location.href = r.url; }
  else { alert(r.error || "Couldn't start Google connect."); }
}

async function preview() {
  const { plan } = await api("/api/preview", { instruction: $("instruction").value });
  const out = $("planOut");
  out.classList.remove("hidden");
  if (!plan.steps.length) { out.innerHTML = '<p class="muted">' + plan.summary + '</p>'; return; }
  let html = '<div class="card" style="margin:0;background:var(--bg)">';
  html += '<b>Plan:</b> ' + esc(plan.summary);
  for (const s of plan.steps) {
    const tag = s.sideEffect ? '<span class="tag send">does something</span>' : '<span class="tag">looks only</span>';
    html += '<div class="plan-step">' + tag + '<div>' + esc(s.why) + '</div></div>';
  }
  if (plan.sends.length) {
    html += '<div class="sends safe"><b>Before any of these happen, it asks you first:</b><br>'
      + plan.sends.map(x => '• ' + esc(x.channel) + ' → ' + esc(x.to)).join('<br>') + '</div>';
  }
  html += '</div>';
  out.innerHTML = html;
}

function esc(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

async function refresh() {
  const s = await api("/api/state");
  const checks = $("checks");
  checks.innerHTML = s.readiness.map(r =>
    '<div class="check"><span class="dot ' + (r.ok ? 'on' : '') + '"></span>' + esc(r.label) + '</div>'
  ).join("");
  $("n1").classList.toggle("done", s.telegram.hasToken);
  $("n2").classList.toggle("done", s.claude.hasKey);
  $("n3").classList.toggle("done", s.google.connected);
  if (s.telegram.hasToken) $("tgOk").classList.remove("hidden");
  if (s.claude.hasKey) $("claudeOk").classList.remove("hidden");
  if (s.google.connected) $("gOk").classList.remove("hidden");
}
refresh();
</script>
</body>
</html>`;
}
