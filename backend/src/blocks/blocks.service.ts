// blocks.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { PrismaService } from "src/common/prisma/prisma.service";
import { ValidationService } from "src/common/validation/validation.service";
import { CreateBlockDto, createBlockSchema } from "./dto/create-block.dto";
import { UpdateBlockDto, updateBlockSchema } from "./dto/update-block.dto";
import { ReorderBlockDto, reorderBlocksSchema } from "./dto/reorder-block.dto";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "blocks",
})
@Injectable()
export class BlocksService {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  // Check if user owns the note
  private async validateNoteOwnership(noteId: string, userId: string) {
    const note = await this.prismaService.note.findUnique({
      where: { id: noteId },
      select: { user_id: true },
    });

    if (!note) {
      throw new NotFoundException("Note not found");
    }

    if (note.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this note");
    }
  }

  // Get all blocks for a note
  async getBlocksByNoteId(noteId: string, userId: string) {
    await this.validateNoteOwnership(noteId, userId);

    const blocks = await this.prismaService.block.findMany({
      where: { note_id: noteId },
      orderBy: { position: "asc" },
    });

    return blocks;
  }

  async createBlock(data: CreateBlockDto, userId: string) {
    const newBlock = this.validationService.validate(createBlockSchema, data);
    await this.validateNoteOwnership(data.note_id, userId);

    const block = await this.prismaService.block.create({
      data: {
        note_id: newBlock.note_id,
        parent_id: newBlock.parent_id,
        type: newBlock.type,
        content: newBlock.content,
        props: newBlock.props,
        position: newBlock.position,
      },
    });

    this.server.to(`note-${data.note_id}`).emit("blockCreated", block);

    return block;
  }

  // Update a block
  async updateBlock(data: UpdateBlockDto, userId: string) {
    const updateBlock = this.validationService.validate(
      updateBlockSchema,
      data,
    );

    const block = await this.prismaService.block.findUnique({
      where: { id: updateBlock.id },
      include: { note: true },
    });

    if (!block) {
      throw new NotFoundException("Block not found");
    }

    if (block.note.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this block");
    }

    const updatedBlock = await this.prismaService.block.update({
      where: { id: data.id },
      data: {
        parent_id:
          data.parent_id !== undefined ? data.parent_id : block.parent_id,
        type: data.type || block.type,
        content: {
          toJSON: () => data.content || block.content,
        },
        props: {
          toJSON: () => data.props || block.props,
        },
        position: data.position !== undefined ? data.position : block.position,
      },
    });

    this.server.to(`note-${block.note_id}`).emit("blockUpdated", updatedBlock);

    return updatedBlock;
  }

  async deleteBlock(id: string, userId: string) {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { note: true },
    });

    if (!block) {
      throw new NotFoundException("Block not found");
    }

    if (block.note.user_id !== userId) {
      throw new ForbiddenException("You do not have access to this block");
    }

    const childBlocks = await this.prismaService.block.findMany({
      where: { parent_id: id },
    });

    if (childBlocks.length > 0) {
      await this.prismaService.block.deleteMany({
        where: { parent_id: id },
      });
    }

    await this.prismaService.block.delete({
      where: { id },
    });

    this.server
      .to(`note-${block.note_id}`)
      .emit("blockDeleted", { id, noteId: block.note_id });

    return true;
  }

  async reorderBlocks(data: ReorderBlockDto, userId: string) {
    this.validationService.validate(reorderBlocksSchema, data);

    if (data.length === 0) {
      return true;
    }

    const firstBlockId = data[0].id;
    const firstBlock = await this.prismaService.block.findUnique({
      where: { id: firstBlockId },
      include: { note: true },
    });

    if (!firstBlock) {
      throw new NotFoundException("Block not found");
    }

    if (firstBlock.note.user_id !== userId) {
      throw new ForbiddenException("You do not have access to these blocks");
    }

    await this.prismaService.$transaction(
      data.map((block) =>
        this.prismaService.block.update({
          where: { id: block.id },
          data: {
            position: block.position,
            parent_id: block.parentId ? block.parentId : undefined,
          },
        }),
      ),
    );

    this.server.to(`note-${firstBlock.note_id}`).emit("blocksReordered", data);

    return true;
  }

  // WebSocket methods for collaborative editing
  // handleConnection(client: any, noteId: string, userId: string) {
  //   client.join(`note-${noteId}`);
  //   client.join(`user-${userId}`);

  //   // Broadcast that user joined editing session
  //   this.server.to(`note-${noteId}`).emit("userJoined", {
  //     userId,
  //     timestamp: new Date(),
  //   });
  // }

  // handleDisconnection(client: any, noteId: string, userId: string) {
  //   client.leave(`note-${noteId}`);
  //   client.leave(`user-${userId}`);

  //   // Broadcast that user left editing session
  //   this.server.to(`note-${noteId}`).emit("userLeft", {
  //     userId,
  //     timestamp: new Date(),
  //   });
  // }
}
