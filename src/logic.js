import { openAI } from "./openai.js";
import { textConverter } from "./text.js";
import { code } from "telegraf/format";

export const INITIAL_SESSION = {
  messages: [],
};

export async function initSession(ctx) {
  ctx.session = { messages: [] };
  await ctx.reply("Введите Ваше текстовое или запишите голосовое сообщение.");
}

export async function processTextToChat(ctx, content, voiceOrText) {
  ctx.session.messages.push({
    role: openAI.roles.USER,
    content,
  });

  const response = await openAI.chat(ctx.session.messages);

  if (response) {
    ctx.session.messages.push({
      role: openAI.roles.ASSISTANT,
      content: response.content,
    });

    if (voiceOrText) {
      const source = await textConverter.textToSpeech(response.content);

      await ctx.sendAudio(
        {
          source,
        },
        {
          title: "Ответ от ChatGPT",
          performer: "VoiceGPTBot",
          disable_notification: false,
        }
      );
    } else {
      await ctx.reply(response.content);
    }
  } else {
    await ctx.reply(
      code(
        "Возникла непредвиденная ошибка. Попробуйте выполнить команду /new для очистки контекста общения с ChatGPT."
      )
    );
  }
}
