import pino from "pino";
import { loadEnv } from "../config/index.js";

const env = loadEnv();

export const loggerOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  transport: process.env.NODE_ENV === "production" ? undefined : { target: "pino-pretty" },
};

export const logger = pino(loggerOptions);

