import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),

  MONGO_URI: z.string().default("mongodb://localhost:27017/atr"),
});

export const env = envSchema.parse(process.env);
