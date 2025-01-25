import mongoose from "mongoose";
import logger from "./logger";
import { env } from "./envSchema";

export class MongoConfig {
  constructor() {
    mongoose.Promise = global.Promise;
    mongoose.set("strictQuery", true);
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(env.MONGO_URI);
      logger.info("✅ Established connection with MongoDB");
      this.setupErrorListeners();
    } catch (err) {
      const error = new Error(
        `❌ Failed to connect to MongoDB. Error: ${err}.`
      );
      logger.error(error.message);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.connection.close(false);
  }

  private setupErrorListeners(): void {
    mongoose.connection.on("error", (err) => {
      const error = new Error(
        `❌ An error has occurred with the MongoDB connection: ${err}.`
      );
      logger.error(error.message);
      throw error;
    });
  }
}
