import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import config from "config";
import { ogg } from "./ogg.js";
import { openAI } from "./openai.js";
import { removeFile } from "./utils.js";
import { initSession, processTextToChat, INITIAL_SESSION } from "./logic.js";

const bot = new Telegraf(config.get("TG_TOKEN"));

bot.use(session());

bot.command("start", initSession);
bot.command("new", initSession);

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code("Идет обработка..."));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMP3(oggPath, userId);

    const text = await openAI.transcription(mp3Path);

    removeFile(mp3Path);

    await ctx.reply(code(`Ваш запрос: ${text}`));

    await processTextToChat(ctx, text, true);
  } catch (e) {
    console.log(`Error while voice message: ${e.message}`);
  }
});

bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code("Идет обработка..."));
    await processTextToChat(ctx, ctx.message.text, false);
  } catch (e) {
    console.log(`Error while text messaging: `, e.message);
  }
});

bot.launch();

process.once("SIGINT", () => {
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
});
