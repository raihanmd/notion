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
import { CreateBlockDto } from "./dto/create-block.dto";
import { UpdateBlockDto } from "./dto/update-block.dto";
import { DeleteBlockDto } from "./dto/delete-block.dto";
import { ReorderBlockDto } from "./dto/reorder-block.dto";

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
  private notesMember = new Map<string, string[]>();

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
    } catch (err: any) {
      this.logger.warn(`Client ${client.id} disconnected: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const user = client.data.user;
    if (!user) return;

    for (const [noteId, clients] of this.notesMember.entries()) {
      if (clients.includes(client.id)) {
        this.notesMember.set(
          noteId,
          clients.filter((id) => id !== client.id),
        );
        this.blocksService.handleDisconnection(client, noteId, user.id);
        this.logger.log(
          `Client ${client.id} (User: ${user.id}) disconnected from note: ${noteId}`,
        );
      }
    }
  }

  @SubscribeMessage("joinNote")
  async handleJoinNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string },
  ) {
    try {
      const user = client.data.user;
      const noteId = String(data.noteId);

      for (const [existingNoteId, clients] of this.notesMember.entries()) {
        if (clients.includes(client.id)) {
          client.leave(`note-${existingNoteId}`);
          this.notesMember.set(
            existingNoteId,
            clients.filter((id) => id !== client.id),
          );

          this.blocksService.handleDisconnection(
            client,
            existingNoteId,
            user.id,
          );
          this.logger.log(
            `Client ${client.id} (User: ${user.id}) left note: ${existingNoteId} to join ${noteId}`,
          );
        }
      }

      client.join(`note-${noteId}`);

      const noteMembers = this.notesMember.get(noteId) || [];
      noteMembers.push(client.id);
      this.notesMember.set(noteId, noteMembers);

      this.blocksService.handleConnection(client, noteId, user.id);

      this.logger.log(
        `Client ${client.id} (User: ${user.id}) joined note: ${noteId}`,
      );

      const blocks = await this.blocksService.getBlocksByNoteId(
        noteId,
        user.id,
      );
      return { event: "joinedNote", data: { blocks } };
    } catch (error: any) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage("leaveNote")
  async handleLeaveNote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: string },
  ) {
    try {
      const user = client.data.user;
      const noteId = String(data.noteId);

      client.leave(`note-${noteId}`);

      const clients = this.notesMember.get(noteId) || [];
      const updated = clients.filter((id) => id !== client.id);
      this.notesMember.set(noteId, updated);

      this.blocksService.handleDisconnection(client, noteId, user.id);

      this.logger.log(
        `Client ${client.id} (User: ${user.id}) left note: ${noteId}`,
      );
      return { event: "leftNote", data: { noteId } };
    } catch (error: any) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage("createManyBlocks")
  async handleCreateManyBlock(
    @MessageBody() payload: { noteId: string; blocks: CreateBlockDto[] },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const block = await this.blocksService.createManyBlocks(
        payload.blocks,
        client.data.user.id,
      );

      this.server.to(`note-${payload.noteId}`).emit("blocksCreated", block);
    } catch (error: any) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage("updateManyBlocks")
  async handleUpdateManyBlock(
    @MessageBody() payload: { noteId: string; blocks: UpdateBlockDto[] },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const block = await this.blocksService.updateManyBlocks(
        payload.blocks,
        client.data.user.id,
      );

      this.server.to(`note-${payload.noteId}`).emit("blocksUpdated", block);
    } catch (error: any) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage("deleteManyBlocks")
  async handleDeleteManyBlock(
    @MessageBody() payload: { noteId: string; blocks: DeleteBlockDto[] },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const block = await this.blocksService.deleteManyBlocks(
        payload.blocks,
        client.data.user.id,
      );

      this.server.to(`note-${payload.noteId}`).emit("blocksDeleted", block);
    } catch (error: any) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage("reorderBlocks")
  async handleReorderManyBlock(
    @MessageBody() payload: { noteId: string; blocks: ReorderBlockDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const block = await this.blocksService.reorderBlocks(
        payload.blocks,
        client.data.user.id,
      );

      this.server.to(`note-${payload.noteId}`).emit("blocksReordered", block);
    } catch (error: any) {
      throw new WsException(error.message);
    }
  }
}
