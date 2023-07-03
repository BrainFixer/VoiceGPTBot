import { openAI } from "./openai.js";
import { textConverter } from "./text.js";
import { code } from "telegraf/format";
import numeralize from "numeralize-ru";

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

  let response = await openAI.chat(ctx.session.messages);

  let tokensLeft = 4096 - response?.usage?.total_tokens;
  if (tokensLeft < 0) tokensLeft = 0;

  await ctx.reply(
    code(
      `Ответ от ChatGPT получен. В текущем контексте осталось ${tokensLeft} ${numeralize.pluralize(
        tokensLeft,
        "токен",
        "токена",
        "токенов"
      )}.`
    )
  );

  response = response.choices[0].message;

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
