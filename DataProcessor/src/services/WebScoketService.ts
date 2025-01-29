import { Service } from "typedi";
import { Server as SocketIOServer } from "socket.io";

@Service()
export class WebSocketService {
  private _io?: SocketIOServer;

  public init(io: SocketIOServer): void {
    this._io = io;
  }

  public broadcast(event: string, data: any): void {
    if (!this._io) {
      return;
    }
    this._io.emit(event, data);
  }

  get io(): SocketIOServer | undefined {
    return this._io;
  }
}
