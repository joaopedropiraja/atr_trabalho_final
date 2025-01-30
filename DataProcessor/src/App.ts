import "reflect-metadata";
import "dotenv/config";
import helmet from "helmet";
import morgan from "morgan";
import { createServer, Server } from "http";
import express, { Application } from "express";
import {
  Action,
  ForbiddenError,
  UnauthorizedError,
  useContainer,
  useExpressServer,
} from "routing-controllers";
import { env } from "./config/envSchema";
import logger from "./config/logger";
import { MongoConfig } from "./config/MongoConfig";
import { EXIT_STATUS, HTTP_CODES } from "./config/constants";
import Container from "typedi";
import { WebSocketConfig } from "./config/WebSocketConfig";
import { UserService } from "./services/UserService";
import { JwtService } from "./services/JwtService";

const IS_DEV_ENV = env.NODE_ENV === "development";

class App {
  public app: Application;
  private server: Server;
  private mongoConfig: MongoConfig;
  private webSocketConfig: WebSocketConfig;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.mongoConfig = new MongoConfig();
    this.webSocketConfig = new WebSocketConfig();

    this.initializeMiddlewares();
    this.initializeControllers();
    this.initializeErrorHandlers();
  }

  public async start(): Promise<void> {
    await this.startServices();

    this.server.listen(env.PORT, () => {
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
      this.app.set("trust proxy", 1);
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
      authorizationChecker: async (action: Action, roles: string[]) => {
        const foundUser = await this.currentUserChecker(action);

        if (!roles.length) return true;

        const isForbidden = roles.every((role) =>
          foundUser.roles.find((r) => r === role)
        );
        if (!isForbidden) throw new ForbiddenError("User not allowed.");

        return true;
      },
      currentUserChecker: this.currentUserChecker,
    });
  }

  private async currentUserChecker(action: Action) {
    const userService = Container.get(UserService);
    const jwtService = Container.get(JwtService);

    const authHeader =
      action.request.headers.authorization ||
      action.request.headers.Authorization;
    if (!authHeader) throw new UnauthorizedError("No authorization header");

    const [scheme, token] = authHeader.split(" ");

    if (!/^Bearer$/i.test(scheme))
      throw new UnauthorizedError("Token bad formatted");

    if (!token) throw new UnauthorizedError("No token provided");

    const { userId } = await jwtService.verifyToken(token);

    const foundUser = await userService.getById(userId);
    if (!foundUser) throw new UnauthorizedError("Invalid token");

    return foundUser;
  }

  private async initializeErrorHandlers() {
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
    this.webSocketConfig.connect(this.server);
  }
  private async stopServices(): Promise<void> {
    await this.mongoConfig.disconnect();
    await this.webSocketConfig.disconnect();
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
