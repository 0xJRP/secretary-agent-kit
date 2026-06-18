// The real actions behind the secretary: read the calendar, find open times,
// create events, and send email. These are the "allowed actions" — nothing
// else touches the owner's account.
import { google } from "googleapis";
import { authedClient } from "./auth.js";

// ── Read-only ──────────────────────────────────────────────────────────────

export async function readCalendar({ startISO, endISO }) {
  const cal = google.calendar({ version: "v3", auth: authedClient() });
  const { data } = await cal.events.list({
    calendarId: "primary",
    timeMin: startISO,
    timeMax: endISO,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });
  return (data.items || []).map((e) => ({
    title: e.summary || "(busy)",
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
  }));
}

export async function findFreeSlots({
  durationMinutes = 30,
  withinDays = 7,
  earliestHour = 9,
  latestHour = 17,
}) {
  const cal = google.calendar({ version: "v3", auth: authedClient() });
  const now = new Date();
  const horizon = new Date(now.getTime() + withinDays * 86_400_000);
  const { data } = await cal.freebusy.query({
    requestBody: {
      timeMin: now.toISOString(),
      timeMax: horizon.toISOString(),
      items: [{ id: "primary" }],
    },
  });
  const busy = (data.calendars?.primary?.busy || []).map((b) => [
    new Date(b.start),
    new Date(b.end),
  ]);
  return computeSlots(now, horizon, busy, durationMinutes, earliestHour, latestHour);
}

// Walk the working-hours window in 30-min steps, skipping anything that
// overlaps a busy block. Returns up to 6 candidate slots.
function computeSlots(from, to, busy, durMin, earliest, latest) {
  const slots = [];
  const durMs = durMin * 60_000;
  const cursor = new Date(from);
  cursor.setMinutes(0, 0, 0);
  while (cursor < to && slots.length < 6) {
    const hour = cursor.getHours();
    const endsBy = hour + durMin / 60;
    if (cursor > from && hour >= earliest && endsBy <= latest) {
      const slotEnd = new Date(cursor.getTime() + durMs);
      const overlaps = busy.some(([bs, be]) => cursor < be && slotEnd > bs);
      if (!overlaps) {
        slots.push({ startISO: cursor.toISOString(), endISO: slotEnd.toISOString() });
      }
    }
    cursor.setTime(cursor.getTime() + 30 * 60_000);
  }
  return slots;
}

// ── Actions (only run after the owner confirms) ─────────────────────────────

export async function createEvent({ title, startISO, endISO, attendees = [] }) {
  const cal = google.calendar({ version: "v3", auth: authedClient() });
  const { data } = await cal.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: title,
      start: { dateTime: startISO },
      end: { dateTime: endISO },
      attendees: attendees.map((email) => ({ email })),
    },
  });
  return { id: data.id, link: data.htmlLink };
}

export async function sendEmail({ to, subject, body }) {
  const gmail = google.gmail({ version: "v1", auth: authedClient() });
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");
  const raw = Buffer.from(mime).toString("base64url");
  const { data } = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return { id: data.id };
}
