import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OGGConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMP3(inFile, outFile) {
    try {
      const outputPath = resolve(dirname(inFile), `${outFile}.mp3`);
      return new Promise((resolve, reject) => {
        ffmpeg(inFile)
          .inputOption("-t 30")
          .output(outputPath)
          .on("end", () => {
            removeFile(inFile);
            resolve(outputPath);
          })
          .on("error", (err) => reject(err))
          .run();
      });
    } catch (e) {
      console.log(`Error while creating MP3: ${e.message}`);
    }
  }

  async create(url, fileName) {
    const oggPath = resolve(__dirname, "../voices", `${fileName}.ogg`);
    try {
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => {
          resolve(oggPath);
        });
      });
    } catch (e) {
      console.log(`Error while creating OGG: ${e.message}`);
    }
  }
}

export const ogg = new OGGConverter();
