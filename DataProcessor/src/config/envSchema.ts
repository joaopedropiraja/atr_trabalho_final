import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),
  BASE_ROUTE: z.string().default("/api/v1"),

  MONGO_URI: z.string().default("mongodb://localhost:27017/atr"),

  MQTT_HOST: z.string().default("localhost"),
  MQTT_PORT: z.coerce.number().default(1883),
});

export const env = envSchema.parse(process.env);
