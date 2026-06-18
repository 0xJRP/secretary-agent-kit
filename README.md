# 🐇 Secretary Agent Kit

### Your AI secretary — on any messenger. Text it like an assistant, and it actually *does* things.

> *"Ask Sarah (sarah@…) to grab 30 minutes next week — find a time that's open on
> my calendar and propose it."*

You send that to your bot on Telegram. It reads your Google Calendar, drafts the
email to Sarah, shows you the plan, and — once you say **yes** — sends it and
books the meeting. A real assistant, powered by **Claude**.

This is **Day 2** of Rabbithole's [30 Days of AI Kits](https://rabbithole.consulting).
([Day 1 was the Plain-English MCP Starter Kit.](https://github.com/0xJRP/mcp-starter-kit))

---

## Two ways to use this

### ⚡ The no-code way (5 minutes)
You don't have to run anything. The **Claude app** can connect to Google Calendar
and Gmail directly through **connectors**. Open Claude → Settings → Connectors →
connect Google Calendar and Gmail → then just ask it to schedule things. The setup
wizard walks you through it visually.

### 🛠️ The build-it way (you own it)
Run your own bot on Telegram, connected to your own Google account and your own
Claude key. More setup, but it's yours — extend it, run it for your team, put it
on any messenger.

**Either way, start with the visual wizard** — it explains every step,
button by button, and shows you exactly what's happening (and what's safe).

---

## Set it up

**You need:** [Node.js](https://nodejs.org) (the free "LTS" download), a
[Telegram](https://telegram.org) account, a [Claude API key](https://console.anthropic.com),
and a Google account.

```bash
npm install
npm run setup
```

Then open **http://localhost:4322** and follow the wizard:

1. **Make a Telegram bot** with BotFather (it hands you a token).
2. **Connect Claude** (paste your API key — the secretary's brain).
3. **Connect Google** (approve Calendar + Gmail on Google's own screen).
4. **Try it** — type an instruction and see the *plan* before anything is sent.
5. **Go live:** `npm start`, then text your bot.

Check your setup anytime with `npm run check`.

---

## Why it's safe

This agent *takes real actions*, so safety is built in:

- **Confirm before send.** It drafts emails and proposes meetings, then waits for
  your **yes**. By design, Claude *cannot* send mail or book events on its own —
  the sending happens in your code, only after you approve.
- **A short list of allowed actions.** Read your calendar, find open times, send
  email, create events. Nothing else touches your account.
- **Your keys stay on your machine.** Tokens live in `config.json` and `tokens/`
  (both gitignored). Nothing is sent to us.

It's the same "5 questions before you connect AI to anything" spirit as Day 1 —
now applied to an agent that does things, not just reads them.

---

## How it's built (for the curious)

```
  Telegram  ──►  Agent (Claude)  ──►  Google Calendar + Gmail
   adapter        tool loop            allowed actions
```

- `src/channels/` — one file per messenger. Telegram today; the adapter interface
  lets WhatsApp/Slack/etc. drop in later without touching the agent.
- `src/agent/` — the Claude tool loop and the confirm-before-send logic.
- `src/google/` — OAuth + the Calendar/Gmail actions.
- `src/wizard/` — the visual, button-by-button setup experience.

Default model: `claude-opus-4-8` (smartest). Switch to `claude-sonnet-4-6` in
`config.json` to save cost.

---

## 🐇 Built by Rabbithole

We build custom AI infrastructure for businesses — **end to end**. This kit is the
DIY taste; we do the production version with your real tools, your team, and
guardrails that fit how you actually work.

**Want this set up for your business?**
👉 **[Book a call with Rabbithole](https://rabbithole.consulting/#book)**

*Free to use under the MIT License. Day 2 of 30 · [rabbithole.consulting](https://rabbithole.consulting)*
