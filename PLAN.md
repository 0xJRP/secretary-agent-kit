# 🐇 Secretary Agent Kit — Plan (Rabbithole Day 2)

> **Your AI secretary, on any messenger.** Tell it *"DM Sarah and find a time
> that works on my calendar this week,"* and it actually does it — reads your
> calendar, messages the person, negotiates a slot, and books it.

This is **Day 2** of the 30-day series. Day 1 (`../mcp-starter-kit`) was a
read-only MCP server for business data. This is a different domain entirely: a
**live, Claude-powered agent** that takes real actions across a messenger and
your Google account. No overlap with Day 1.

---

## What it does (the demo we're selling)

You message your bot on Telegram:

> *"Ask Sarah (sarah@…) to grab 30 min this week. Find a time that's open on my
> calendar and propose it to her."*

The agent:
1. Reads **your Google Calendar** to find open slots.
2. **Messages Sarah** (via the same bot, a DM, or a drafted email) proposing times.
3. Reads her reply, picks the agreed time.
4. **Creates the calendar event** and confirms back to you.

Acting like a real secretary — not just answering questions, but doing outreach
and closing the loop.

---

## The two tracks we teach (this is the hook)

For every capability we show **both** paths, side by side:

- **Track A — Build it (the repo).** BotFather → token → Google OAuth → run →
  chat. The DIY version, fully owned by them.
- **Track B — No-build (Claude connectors).** How to get similar power *inside
  Claude* using MCP connectors (Google Calendar / Gmail), no code. For people
  who don't want to run anything.

The teaching style: **button-by-button, step-by-step, visual.** At each
connection point we explain *what is actually happening* and *why it's safe* —
just like the Day 1 playground, but for a live agent.

---

## Architecture (channel-agnostic on purpose)

```
  Messenger (Telegram → later WhatsApp/others)
        │  channel adapter (normalizes messages in/out)
        ▼
  Agent core (Claude API) — the brain, runs a tool-using loop
        │  tools
        ▼
  Google APIs:  Calendar (find free time, create event)
                Gmail (read, draft, send)
```

- **Channel adapters** — `telegram` first (BotFather, no business verification).
  WhatsApp is an *advanced* adapter (needs Meta/Twilio verification — call this
  out honestly so beginners start with Telegram).
- **Agent core** — Claude (default `claude-sonnet-4-6`, or `claude-opus-4-8` for
  the hardest scheduling reasoning) running an agent loop with tool calls.
- **Tools** — Google Calendar + Gmail, behind a clear allow-list (echoing Day 1's
  "the AI can only do the actions you allow").
- **Visual setup wizard** — a local browser page that walks BotFather token →
  Google OAuth → first chat, narrating each step.

---

## Safety (carry the Day 1 ethos forward)

This agent *takes actions* (sends messages, books events), so safety matters
more than Day 1. Reuse the **"5 questions"** framing and add:
- Explicit allow-list of tools; nothing it can't undo without confirming.
- A **dry-run / confirm-before-send** mode by default — it drafts, you approve.
- Clear scope disclosure on Google OAuth (what each scope grants).

---

## Build order (proposed)

1. `README.md` — plain-English pitch + the two tracks. ✅ next
2. `config` schema + `.env.example` (BotFather token, Google creds, Claude key).
3. Channel adapter interface + **Telegram adapter** skeleton.
4. Google tools (Calendar first, then Gmail).
5. Agent core (Claude tool loop) with confirm-before-send.
6. Visual setup wizard (browser, button-by-button).
7. Track B doc: doing it inside Claude with connectors.

> WhatsApp / other messengers: stub the adapter interface now, document the
> verification reality, implement later.
