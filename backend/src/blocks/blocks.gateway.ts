import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { BlocksService } from "./blocks.service";
import { Logger } from "@nestjs/common";
import * as cookie from "cookie";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "blocks",
})
export class BlocksGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BlocksGateway.name);
  private clientNotes = new Map<string, string[]>();

  constructor(
    private readonly blocksService: BlocksService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.blocksService.setServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const rawCookie = client.handshake.headers.cookie;
      if (!rawCookie) throw new Error("No cookie provided");

      const cookies = cookie.parse(rawCookie);
      const token = cookies["token"];

      if (!token) throw new Error("No token provided");

      const user = jwt.verify(
        token,
        this.configService.get("JWT_SECRET")!,
      ) as User;
      client.data.user = user;

      client.join(`user-${user.id}`);
      this.logger.log(`Client connected: ${client.id}, User: ${user.id}`);
      this.clientNotes.set(client.id, []);
    } catch (err: any) {
      this.logger.warn(`Client ${client.id} disconnected: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const notes = this.clientNotes.get(client.id) || [];

    const user = client.data.user;
    if (user) {
      for (const noteId of notes) {
        this.blocksService.handleDisconnection(client, noteId, user.id);
      }
    }

    this.clientNotes.delete(client.id);
  }

  @SubscribeMessage("joinNote")
  async handleJoinNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string | number },
  ) {
    try {
      const user = client.data.user;
      const noteId = String(data.noteId);

      client.join(`note-${noteId}`);

      const clientNotes = this.clientNotes.get(client.id) || [];
      if (!clientNotes.includes(noteId)) {
        clientNotes.push(noteId);
        this.clientNotes.set(client.id, clientNotes);
      }

      this.blocksService.handleConnection(client, noteId, user.id);

      this.logger.log(
        `Client ${client.id} (User: ${user.id}) joined note: ${noteId}`,
      );
      return { event: "joinedNote", data: { noteId } };
    } catch (error: any) {
      return new WsException(error.message);
    }
  }

  @SubscribeMessage("leaveNote")
  async handleLeaveNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string | number },
  ) {
    try {
      const user = client.data.user;
      const noteId = String(data.noteId);

      client.leave(`note-${noteId}`);

      const clientNotes = this.clientNotes.get(client.id) || [];
      const updatedNotes = clientNotes.filter((id) => id !== noteId);
      this.clientNotes.set(client.id, updatedNotes);

      this.blocksService.handleDisconnection(client, noteId, user.id);

      this.logger.log(
        `Client ${client.id} (User: ${user.id}) left note: ${noteId}`,
      );
      return { event: "leftNote", data: { noteId } };
    } catch (error: any) {
      return new WsException(error.message);
    }
  }

  @SubscribeMessage("blockChange")
  async handleBlockChange(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      action: string;
      block: any;
      noteId: string | number;
      userId: string | number;
    },
  ) {
    try {
      const noteId = String(data.noteId);
      this.logger.log(`Block change in note ${noteId}: ${data.action}`);

      // Store the change in the database if needed
      // this.blocksService.storeBlockChange(data);

      // Broadcast to all clients in the note room except sender
      client.to(`note-${noteId}`).emit("blockChanged", data);

      return { event: "blockChangeAcknowledged", data };
    } catch (error: any) {
      return new WsException(error.message);
    }
  }
}
