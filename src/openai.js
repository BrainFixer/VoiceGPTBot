import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";
import config from "config";

class OpenAI {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };
  constructor(apiKey, organizationId) {
    const configuration = new Configuration({
      apiKey: apiKey,
      organization: organizationId,
    });
    this.openAI = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });
      return response.data.choices[0].message;
    } catch (e) {
      console.log(`Error while chatting: ${e.message}`);
    }
  }

  async transcription(filePath) {
    try {
      const response = await this.openAI.createTranscription(
        createReadStream(filePath),
        "whisper-1"
      );
      return response.data.text;
    } catch (e) {
      console.log(`Error while transcription: ${e.message}`);
    }
  }
}

export const openAI = new OpenAI(
  config.get("OAI_TOKEN"),
  config.get("OAI_ORG_ID")
);
