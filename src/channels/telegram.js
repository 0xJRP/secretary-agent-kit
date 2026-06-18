// Telegram channel adapter. This is the ONLY messenger-specific file — it
// implements the small interface the agent talks to, so WhatsApp/Slack/etc.
// can be added later as sibling adapters without touching the agent.
//
// The interface a channel must provide:
//   start({ onMessage })  → begin receiving; calls onMessage({chatId,text,senderName})
//   sendMessage(chatId, text)
//   stop()
import { Telegraf } from "telegraf";

export function createTelegramChannel(token) {
  if (!token) throw new Error("No Telegram bot token — run `npm run setup`.");
  const bot = new Telegraf(token);

  return {
    name: "telegram",

    async start({ onMessage }) {
      bot.on("text", async (ctx) => {
        await onMessage({
          chatId: String(ctx.chat.id),
          text: ctx.message.text,
          senderName: ctx.from?.first_name || "there",
        });
      });
      // Don't await launch() — it resolves only when the bot stops.
      bot.launch();
      // Graceful shutdown on Ctrl+C.
      process.once("SIGINT", () => bot.stop("SIGINT"));
      process.once("SIGTERM", () => bot.stop("SIGTERM"));
    },

    async sendMessage(chatId, text) {
      await bot.telegram.sendMessage(chatId, text);
    },

    stop() {
      bot.stop();
    },
  };
}
