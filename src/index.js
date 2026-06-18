// Entry point. `npm start` launches the secretary on your messenger.
// `npm run check` (node src/index.js --check) verifies setup without starting.
import { load, readiness } from "./config.js";
import { createTelegramChannel } from "./channels/telegram.js";
import { handleMessage } from "./agent/secretary.js";

const cfg = load();

if (process.argv.includes("--check")) {
  const checks = readiness(cfg);
  console.log("\n  🐇 Secretary Agent Kit — readiness check\n");
  for (const c of checks) console.log(`   ${c.ok ? "✅" : "⬜"}  ${c.label}`);
  const ready = checks.every((c) => c.ok);
  console.log(
    ready
      ? "\n  All set — run `npm start` to go live.\n"
      : "\n  Not ready yet — run `npm run setup` to finish connecting.\n"
  );
  process.exit(ready ? 0 : 1);
}

// Pick the channel (Telegram today; the adapter interface lets others drop in).
if (cfg.channel !== "telegram") {
  console.error(`Channel "${cfg.channel}" isn't built yet — only "telegram" so far.`);
  process.exit(1);
}

const channel = createTelegramChannel(cfg.telegram.botToken);

await channel.start({
  onMessage: async (msg) => {
    const reply = (text) => channel.sendMessage(msg.chatId, text);
    try {
      await handleMessage(msg, reply);
    } catch (err) {
      console.error("handleMessage error:", err);
      await reply("Sorry — something went wrong on my end. Try again?");
    }
  },
});

console.log("\n  🐇 Your secretary is live on Telegram. Text your bot to begin.\n");
