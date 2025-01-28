import { Service } from "typedi";
import { Server as SocketIOServer } from "socket.io";

@Service()
export class WebSocketService {
  private io?: SocketIOServer;

  public init(io: SocketIOServer): void {
    this.io = io;
  }

  public broadcast(event: string, data: any): void {
    if (!this.io) {
      return;
    }
    this.io.emit(event, data);
  }

  public getIO(): SocketIOServer | undefined {
    return this.io;
  }
}
