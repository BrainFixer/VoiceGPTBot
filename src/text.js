import jwt from "jsonwebtoken";
import axios from "axios";
import config from "config";

class TextConverter {
  async getToken() {
    const key = config.get("TTS_KEY");

    const token = jwt.sign(
      {
        iss: key.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://www.googleapis.com/oauth2/v4/token",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        iat: Math.floor(Date.now() / 1000),
      },
      key.private_key,
      { algorithm: "RS256" }
    );

    const response = await axios.post(
      "https://www.googleapis.com/oauth2/v4/token",
      {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: token,
      }
    );

    return response.data.access_token;
  }

  async textToSpeech(text) {
    try {
      const url = "https://texttospeech.googleapis.com/v1/text:synthesize";

      const data = {
        input: { text },
        voice: {
          languageCode: "ru-RU",
          name: "ru-RU-Wavenet-C",
        },
        audioConfig: { audioEncoding: "MP3" },
      };

      const accessToken = await this.getToken();

      const response = await axios({
        url,
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return Buffer.from(response.data.audioContent, "base64");
    } catch (e) {
      console.error("Error while Text2Speech", e.message);
    }
  }
}

export const textConverter = new TextConverter();
