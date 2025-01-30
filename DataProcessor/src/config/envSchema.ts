import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
  BASE_ROUTE: z.string().default("/api/v1"),

  MONGO_URI: z.string().default("mongodb://localhost:27017/atr"),

  MQTT_USERNAME: z.string().default("admin"),
  MQTT_PASSWORD: z.string().default("123456"),
  MQTT_HOST: z.string().default("localhost"),
  MQTT_PORT: z.coerce.number().default(1883),

  ACCESS_TOKEN_SECRET: z.string().default("mysecret"),
  ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().default(86400),
});

export const env = envSchema.parse(process.env);
