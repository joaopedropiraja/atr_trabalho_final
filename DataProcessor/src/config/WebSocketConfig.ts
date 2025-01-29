import logger from "./logger";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import Container from "typedi";
import { WebSocketService } from "../services/WebScoketService";

export class WebSocketConfig {
  private io: SocketIOServer | null = null;

  public connect(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    const webSocketService = Container.get(WebSocketService);
    webSocketService.init(this.io);

    this.io.on("connection", (socket) => {
      logger.info(`✅ Socket connected: ${socket.id}`);

      socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public async disconnect(): Promise<void> {
    await this.io?.close();
  }
}
