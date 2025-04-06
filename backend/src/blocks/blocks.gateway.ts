import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { BlocksService } from "./blocks.service";
import { Logger } from "@nestjs/common";

// @UseGuards(JwtGuard)
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "blocks",
})
export class BlocksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BlocksGateway.name);
  private clientNotes = new Map<string, string[]>(); // Maps client IDs to note IDs they're subscribed to

  constructor(private readonly blocksService: BlocksService) {}

  async handleConnection(client: Socket) {
    const user = client.handshake.auth.user;

    if (!user) {
      this.logger.warn(`Client ${client.id} disconnected: No user provided`);
      client.disconnect();
      return;
    }

    client.join(`user-${user.id}`);
    this.logger.log(`Client connected: ${client.id}, User: ${user.id}`);

    // Initialize empty array of notes for this client
    this.clientNotes.set(client.id, []);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Get all notes this client was subscribed to
    // const notes = this.clientNotes.get(client.id) || [];

    // Notify blocks service about the disconnection for each note
    // const user = client.handshake.auth.user;
    // if (user) {
    //   for (const noteId of notes) {
    //     this.blocksService.handleDisconnection(client, noteId, user.id);
    //   }
    // }

    // Clean up
    this.clientNotes.delete(client.id);
  }

  @SubscribeMessage("joinNote")
  async handleJoinNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string | number },
  ) {
    const user = client.handshake.auth.user;
    const noteId = String(data.noteId);

    client.join(`note-${noteId}`);

    const clientNotes = this.clientNotes.get(client.id) || [];
    if (!clientNotes.includes(noteId)) {
      clientNotes.push(noteId);
      this.clientNotes.set(client.id, clientNotes);
    }

    // this.blocksService.handleConnection(client, noteId, user.id);

    this.logger.log(
      `Client ${client.id} (User: ${user.id}) joined note: ${noteId}`,
    );
    return { event: "joinedNote", data: { noteId } };
  }

  @SubscribeMessage("leaveNote")
  async handleLeaveNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string | number },
  ) {
    const user = client.handshake.auth.user;
    const noteId = String(data.noteId);

    // Leave the room for this note
    client.leave(`note-${noteId}`);

    // Remove this note from the client's subscriptions
    const clientNotes = this.clientNotes.get(client.id) || [];
    const updatedNotes = clientNotes.filter((id) => id !== noteId);
    this.clientNotes.set(client.id, updatedNotes);

    // Let the service know about this disconnection
    // this.blocksService.handleDisconnection(client, noteId, user.id);

    this.logger.log(
      `Client ${client.id} (User: ${user.id}) left note: ${noteId}`,
    );
    return { event: "leftNote", data: { noteId } };
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
    const noteId = String(data.noteId);
    this.logger.log(`Block change in note ${noteId}: ${data.action}`);

    // Store the change in the database if needed
    // this.blocksService.storeBlockChange(data);

    // Broadcast to all clients in the note room except sender
    client.to(`note-${noteId}`).emit("blockChanged", data);

    return { event: "blockChangeAcknowledged", data };
  }
}
