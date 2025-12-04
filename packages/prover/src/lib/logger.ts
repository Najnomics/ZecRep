import pino from "pino";

/**
 * Logger for the prover CLI.
 * Uses structured logging with Pino for better observability.
 */
export const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
};

export const logger = pino(loggerOptions);

