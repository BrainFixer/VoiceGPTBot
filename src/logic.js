import { openAI } from "./openai.js";
import { textConverter } from "./text.js";
import { Markup } from "telegraf";
import { code } from "telegraf/format";
import numeralize from "numeralize-ru";

export const INITIAL_SESSION = {
  messages: [],
};

export async function startBot(ctx) {
  ctx.session = { messages: [] };
  await ctx.reply(
    code("Введите Ваше текстовое или запишите голосовое сообщение."),
    keyboard
  );
}

const keyboard = Markup.keyboard([
  ["Очистить контекст"],
  ["Запустить бота"],
]).resize();

export async function initSession(ctx) {
  ctx.session = { messages: [] };
  await ctx.reply(
    code(
      "Контекст очищен. Введите Ваше текстовое или запишите голосовое сообщение."
    )
  );
}

export async function processTextToChat(ctx, content, voiceOrText) {
  ctx.session.messages.push({
    role: openAI.roles.USER,
    content,
  });

  let response = await openAI.chat(ctx.session.messages);

  if (response) {
    let tokensLeft = 4096 - response?.usage?.total_tokens;
    if (tokensLeft) {
      if (tokensLeft < 0) tokensLeft = 0;
      if (tokensLeft) {
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
      } else {
        await ctx.reply(
          code(
            `Ответ от ChatGPT получен. Текущий контекст переполнен. Выполните команду /new для очистки контекста.`
          )
        );
      }
    }

    response = response.choices[0].message;

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
        "Возникла непредвиденная ошибка. Попробуйте выполнить команду /new для очистки контекста."
      )
    );
  }
}
