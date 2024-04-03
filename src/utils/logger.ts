import pino from "pino";
import PinoHttp from "pino-http";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

export const logger2 = PinoHttp({
  serializers: {
    req(req) {
      req.body = req.raw.body;
      return req;
    },
  },
});
