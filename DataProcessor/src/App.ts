import "reflect-metadata";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "node:http";
import express, { Application } from "express";
import { useExpressServer } from "routing-controllers";
import { env } from "./config/envSchema";
import logger from "./config/logger";
import { MongoConfig } from "./config/MongoConfig";
import { CryptoMonitorController } from "./controllers/CryptoMonitorController";
import { EXIT_STATUS, HTTP_CODES } from "./config/constants";

class App {
  public app: Application;
  private mongoConfig: MongoConfig;
  private server?: Server;

  constructor() {
    this.app = express();
    this.mongoConfig = new MongoConfig();

    this.initializeMiddlewares();
    this.initializeControllers();
    this.setErrorHandlers();
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
    // this.app.use(helmet());

    // if (env.NODE_ENV === "development") this.app.use(morgan("dev"));
    // else this.app.set("trust proxy", 1); // trust first proxy
  }

  private initializeControllers(): void {
    const cors = {
      origin: "*",
      credentials: true,
      optionsSuccessStatus: HTTP_CODES.OK,
    };
    const defaults = {
      undefinedResultCode: HTTP_CODES.NO_CONTENT,
      nullResultCode: HTTP_CODES.NOT_FOUND,
      paramOptions: { required: true },
    };

    useExpressServer(this.app, {
      // cors,
      // defaults,
      routePrefix: env.BASE_ROUTE,
      controllers: [CryptoMonitorController],
    });

    // this.app.use("*", (req, res) => {
    //   res.status(HTTP_CODES.NOT_FOUND).json({ message: "Route not found!" });
    // });
  }

  private setErrorHandlers(): void {}

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
