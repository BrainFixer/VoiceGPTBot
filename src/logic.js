import { openAI } from "./openai.js";
import { textConverter } from "./text.js";

export const INITIAL_SESSION = {
  messages: [],
};

export async function initCommand(ctx) {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Введите Ваше текстовое или запишите голосовое сообщение");
}

export async function processTextToChat(ctx, content) {
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

    // await ctx.reply(response.content);

    const source = await textConverter.textToSpeech(response.content);

    await ctx.sendAudio(
      {
        source,
      },
      {
        title: "Ответ от ChatGPT",
        performer: "VoiceGPTBot",
      }
    );
  }
}
