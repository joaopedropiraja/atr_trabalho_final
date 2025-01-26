import "reflect-metadata";
import "dotenv/config";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "node:http";
import express, { Application } from "express";
import { useContainer, useExpressServer } from "routing-controllers";
import { env } from "./config/envSchema";
import logger from "./config/logger";
import { MongoConfig } from "./config/MongoConfig";
import { EXIT_STATUS, HTTP_CODES } from "./config/constants";
import Container from "typedi";

const IS_DEV_ENV = env.NODE_ENV === "development";

class App {
  public app: Application;
  private mongoConfig: MongoConfig;
  private server?: Server;

  constructor() {
    this.app = express();
    this.mongoConfig = new MongoConfig();

    this.initializeMiddlewares();
    this.initializeControllers();
  }

  public async start(): Promise<void> {
    await this.startServices();

    this.server = this.app.listen(env.PORT, () => {
      logger.info(`✅ Server running on http://localhost:${env.PORT}`);
    });

    this.setGracefulShutdown();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(morgan("dev"));

    if (IS_DEV_ENV) {
      this.app.use(morgan("dev"));
    } else {
      this.app.set("trust proxy", 1); // trust first proxy
      this.app.use(helmet());
    }
  }

  private initializeControllers(): void {
    useContainer(Container);

    const cors = {
      origin: "*",
      credentials: true,
      optionsSuccessStatus: HTTP_CODES.OK,
    };
    const defaults = {
      undefinedResultCode: HTTP_CODES.NO_CONTENT,
      nullResultCode: HTTP_CODES.NOT_FOUND,
    };

    useExpressServer(this.app, {
      cors,
      defaults,
      validation: true,
      routePrefix: env.BASE_ROUTE,
      development: IS_DEV_ENV,
      controllers: [__dirname + "/controllers/*.ts"],
    });

    this.app.use("*", (req, res, next) => {
      if (!res.headersSent) {
        res.status(HTTP_CODES.NOT_FOUND).json({ message: "Route not found." });
      } else {
        next();
      }
    });
  }

  private async startServices(): Promise<void> {
    await this.mongoConfig.connect();
  }
  private async stopServices(): Promise<void> {
    await this.mongoConfig.disconnect();
  }

  private setGracefulShutdown() {
    const exitSignals = ["SIGINT", "SIGTERM", "SIGQUIT"];
    exitSignals.forEach((signal) => {
      process.on(signal, () => {
        this.server?.close(async () => {
          try {
            await this.stopServices();
            logger.info("App exited with success");
            process.exit(EXIT_STATUS.SUCCESS);
          } catch (error) {
            logger.error(error, "App exited with failure");
            process.exit(EXIT_STATUS.FAILURE);
          }
        });
      });
    });
  }
}

export default App;
