import pino from "pino";
import pretty from "pino-pretty";
import { env } from "./envSchema";

const IS_DEV_ENV = env.NODE_ENV === "development";

const destination = IS_DEV_ENV
  ? pretty({
      levelFirst: true,
      colorize: true,
      translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    })
  : pino.transport({
      target: "pino/file",
      options: { destination: `${__dirname}/../../app.log` },
    });

const logger = pino(
  {
    base: { pid: false },
    level: process.env.PINO_LOG_LEVEL || "info",
  },
  destination
);

export default logger;
