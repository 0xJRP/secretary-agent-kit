// A *preview* of what the secretary would do — no Claude call, no API calls,
// nothing sent. The wizard uses this so an owner can see the shape of an
// agent's plan (and the confirm-before-send safety) before any keys are live.
//
// The real agent (src/agent/) will hand the instruction to Claude, which picks
// these same tools for real. This heuristic just mirrors the idea visibly.

const TOOLS = {
  read_calendar: "Read your Google Calendar to find open times",
  create_event: "Create an event on your Google Calendar",
  send_email: "Send an email via Gmail (reaches anyone)",
  send_telegram: "Message someone on Telegram (only if they've opted in)",
};

// Pull an email address and a person's name out of free text, best-effort.
function extractRecipient(text) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const named = text.match(/\b(?:dm|message|email|ask|tell|invite)\s+([A-Z][a-z]+)/)?.[1];
  return { email, name: named || (email ? email.split("@")[0] : null) };
}

export function planFromInstruction(instruction) {
  const text = instruction.trim();
  if (!text) {
    return { summary: "Type an instruction above to see the plan.", steps: [], sends: [] };
  }

  const lc = text.toLowerCase();
  const { email, name } = extractRecipient(text);
  const wantsSchedule = /(schedule|meeting|time|calendar|book|slot|30 ?min|call)/.test(lc);
  const wantsReach = /(dm|message|email|ask|tell|invite|reach out)/.test(lc);

  const steps = [];
  const sends = [];

  if (wantsSchedule) {
    steps.push({ tool: "read_calendar", why: TOOLS.read_calendar, sideEffect: false });
  }

  if (wantsReach && (email || name)) {
    const who = name ? `${name}${email ? ` (${email})` : ""}` : email;
    // Prefer Gmail for outreach to a third party — it reaches anyone.
    const tool = email ? "send_email" : "send_telegram";
    steps.push({
      tool,
      why: `${TOOLS[tool]} — propose times to ${who}`,
      sideEffect: true,
    });
    sends.push({ channel: email ? "Gmail" : "Telegram", to: who });
  }

  if (wantsSchedule) {
    steps.push({
      tool: "create_event",
      why: `${TOOLS.create_event} — once a time is agreed`,
      sideEffect: true,
    });
    sends.push({ channel: "Calendar", to: "your calendar" });
  }

  if (!steps.length) {
    steps.push({
      tool: "ask_you",
      why: "Ask you a clarifying question — the instruction was open-ended",
      sideEffect: false,
    });
  }

  const summary = wantsSchedule
    ? `Find a time on your calendar${name || email ? ` and reach out to ${name || email}` : ""}, then book it.`
    : "Handle this request and report back.";

  return { summary, steps, sends };
}
