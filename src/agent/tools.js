// The tools Claude is allowed to use. Note the deliberate split:
//   • read tools run immediately (they only LOOK at the calendar)
//   • propose_actions does NOT send/book anything — it records a proposal the
//     owner must confirm. The actual sending/booking happens in our code, after
//     confirmation. That's how "confirm before send" is structurally guaranteed:
//     Claude literally cannot send an email or book an event on its own.
import { readCalendar, findFreeSlots } from "../google/tools.js";

export const toolDefs = [
  {
    name: "read_calendar",
    description:
      "Read the owner's Google Calendar events between two ISO-8601 timestamps. Use this to understand existing commitments before proposing anything.",
    input_schema: {
      type: "object",
      properties: {
        startISO: { type: "string", description: "Window start, ISO-8601" },
        endISO: { type: "string", description: "Window end, ISO-8601" },
      },
      required: ["startISO", "endISO"],
    },
  },
  {
    name: "find_free_slots",
    description:
      "Find open time slots on the owner's calendar within the next N days, during working hours. Use this when scheduling a meeting. Returns candidate slots as ISO-8601 ranges.",
    input_schema: {
      type: "object",
      properties: {
        durationMinutes: { type: "integer", description: "Meeting length, default 30" },
        withinDays: { type: "integer", description: "How far ahead to look, default 7" },
        earliestHour: { type: "integer", description: "Earliest hour (0-23), default 9" },
        latestHour: { type: "integer", description: "Latest hour (0-23), default 17" },
      },
    },
  },
  {
    name: "propose_actions",
    description:
      "Propose concrete actions for the owner to APPROVE — emails to send and/or events to create — plus a short message back to the owner explaining the plan. Call this once you know what to do. NEVER claim an action is already done; these are proposals the owner must confirm.",
    input_schema: {
      type: "object",
      properties: {
        message_to_user: {
          type: "string",
          description: "Plain-English summary of what you're proposing.",
        },
        emails: {
          type: "array",
          items: {
            type: "object",
            properties: {
              to: { type: "string" },
              subject: { type: "string" },
              body: { type: "string" },
            },
            required: ["to", "subject", "body"],
          },
        },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              startISO: { type: "string" },
              endISO: { type: "string" },
              attendees: { type: "array", items: { type: "string" } },
            },
            required: ["title", "startISO", "endISO"],
          },
        },
      },
      required: ["message_to_user"],
    },
  },
];

// Only the read tools execute here. propose_actions is handled by the loop.
export async function runReadTool(name, input) {
  if (name === "read_calendar") return readCalendar(input);
  if (name === "find_free_slots") return findFreeSlots(input);
  throw new Error(`Not a read tool: ${name}`);
}
