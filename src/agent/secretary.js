// The brain. Takes a message from the owner, lets Claude gather context with
// read tools, then collects a PROPOSAL (emails/events) via propose_actions.
// Nothing is sent until the owner confirms — see tools.js for why that's
// structurally guaranteed.
import Anthropic from "@anthropic-ai/sdk";
import { load } from "../config.js";
import { toolDefs, runReadTool } from "./tools.js";
import { sendEmail, createEvent } from "../google/tools.js";

// Per-chat memory of a proposal awaiting "yes". In-memory is fine for a single
// owner; swap for a store if you run this for many people.
const pendingByChat = new Map();

function systemPrompt(senderName) {
  const now = new Date();
  return [
    `You are ${senderName}'s personal secretary, reachable over a messenger.`,
    `You act like a great executive assistant: proactive, concise, and careful.`,
    `The current date and time is ${now.toString()} (use the owner's local timezone).`,
    ``,
    `How you work:`,
    `1. Use read_calendar / find_free_slots to understand the owner's schedule.`,
    `2. When you know what to do, call propose_actions with concrete drafts`,
    `   (real email addresses, subjects, bodies, and ISO-8601 event times).`,
    `3. NEVER say an email was sent or a meeting was booked. You only PROPOSE;`,
    `   the owner approves, and the system does the sending. Be honest about this.`,
    ``,
    `For outreach: email reaches anyone; only message someone on the messenger if`,
    `they've already started a chat with this bot. Prefer email for new people.`,
    `Keep messages short and friendly — this is a text thread, not a memo.`,
  ].join("\n");
}

export async function handleMessage({ chatId, text, senderName }, reply) {
  const cfg = load();

  // If there's a proposal waiting and the owner is answering it, act on that.
  if (pendingByChat.has(chatId)) {
    if (isAffirmative(text)) return executePending(chatId, reply);
    if (isNegative(text)) {
      pendingByChat.delete(chatId);
      return reply("Okay, I'll hold off. What would you like instead?");
    }
    // Anything else = a new request; drop the stale proposal and continue.
    pendingByChat.delete(chatId);
  }

  if (!cfg.claude.apiKey) return reply("My brain isn't connected yet — run `npm run setup`.");
  const client = new Anthropic({ apiKey: cfg.claude.apiKey });

  const messages = [{ role: "user", content: text }];
  let proposal = null;

  for (let turn = 0; turn < 8; turn++) {
    const res = await client.messages.create({
      model: cfg.claude.model,
      max_tokens: 2048,
      system: systemPrompt(senderName),
      tools: toolDefs,
      messages,
    });
    messages.push({ role: "assistant", content: res.content });

    const toolUses = res.content.filter((b) => b.type === "tool_use");
    if (toolUses.length === 0) {
      const say = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
      if (say) await reply(say);
      break;
    }

    const results = [];
    for (const tu of toolUses) {
      if (tu.name === "propose_actions") {
        proposal = {
          emails: tu.input.emails || [],
          events: tu.input.events || [],
          message: tu.input.message_to_user || "Here's what I'd do:",
        };
        results.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: "Recorded. Awaiting the owner's confirmation.",
        });
      } else {
        try {
          const out = await runReadTool(tu.name, tu.input);
          results.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(out) });
        } catch (err) {
          results.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: `Error: ${err.message}`,
            is_error: true,
          });
        }
      }
    }
    messages.push({ role: "user", content: results });
    if (proposal) break; // got the plan; stop and present it
  }

  if (proposal) await presentProposal(chatId, proposal, cfg, reply);
}

async function presentProposal(chatId, proposal, cfg, reply) {
  if (!proposal.emails.length && !proposal.events.length) {
    return reply(proposal.message); // just a question/answer, nothing to do
  }

  if (!cfg.confirmBeforeSend) {
    pendingByChat.set(chatId, proposal);
    return executePending(chatId, reply);
  }

  pendingByChat.set(chatId, proposal);
  await reply(`${proposal.message}\n\n${describe(proposal)}\n\nReply *YES* to go ahead, or tell me what to change.`);
}

async function executePending(chatId, reply) {
  const proposal = pendingByChat.get(chatId);
  pendingByChat.delete(chatId);
  if (!proposal) return reply("Nothing's queued up right now.");

  const done = [];
  try {
    for (const e of proposal.emails) {
      await sendEmail(e);
      done.push(`✉️  Emailed ${e.to}`);
    }
    for (const ev of proposal.events) {
      const r = await createEvent(ev);
      done.push(`📅 Booked "${ev.title}"${r.link ? ` — ${r.link}` : ""}`);
    }
    await reply(`Done!\n${done.join("\n")}`);
  } catch (err) {
    await reply(`I hit a problem partway through: ${err.message}\n${done.length ? "Completed: " + done.join("; ") : ""}`);
  }
}

function describe(p) {
  const lines = [];
  for (const e of p.emails) lines.push(`✉️  Email to ${e.to} — "${e.subject}"`);
  for (const ev of p.events) lines.push(`📅 Event "${ev.title}" at ${new Date(ev.startISO).toLocaleString()}`);
  return lines.join("\n");
}

const isAffirmative = (t) => /^(y|yes|yep|yeah|yup|sure|ok|okay|confirm|do it|go|send( it)?|book it|please do)\b/i.test(t.trim());
const isNegative = (t) => /^(n|no|nope|cancel|stop|don'?t|hold off|wait)\b/i.test(t.trim());
