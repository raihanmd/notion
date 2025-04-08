import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/common/prisma/prisma.service";
import { ValidationService } from "src/common/validation/validation.service";
import { CreateBlockDto, createBlockSchema } from "./dto/create-block.dto";
import { UpdateBlockDto, updateBlockSchema } from "./dto/update-block.dto";
import { ReorderBlockDto, reorderBlocksSchema } from "./dto/reorder-block.dto";
import { SharePolicy } from "@prisma/client";
import { z } from "zod";

@Injectable()
export class BlocksService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  private async validateNoteOwnership(noteId: string, userId: string) {
    const note = await this.prismaService.note.findUnique({
      where: { id: noteId },
      select: { user_id: true, share_policy: true },
    });

    if (!note) {
      throw new NotFoundException("Note not found");
    }

    if (note.share_policy === SharePolicy.PRIVATE && note.user_id !== userId) {
      throw new NotFoundException("Note not found");
    }
  }

  async getBlocksByNoteId(noteId: string, userId: string) {
    await this.validateNoteOwnership(noteId, userId);
    return this.prismaService.block.findMany({
      where: { note_id: noteId },
      orderBy: { position: "asc" },
    });
  }

  async createBlock(data: CreateBlockDto, userId: string) {
    const newBlock = this.validationService.validate(createBlockSchema, data);
    await this.validateNoteOwnership(newBlock.note_id, userId);

    const block = await this.prismaService.block.create({
      data: newBlock,
    });

    this.server?.to(`note-${newBlock.note_id}`).emit("blockCreated", block);
    return block;
  }

  async createManyBlocks(data: CreateBlockDto[], userId: string) {
    const validated = this.validationService.validate(
      z.array(createBlockSchema),
      data,
    );

    const noteId = validated[0].note_id;
    await this.validateNoteOwnership(noteId, userId);

    await this.prismaService.block.createMany({
      data: validated,
    });

    const blocks = await this.prismaService.block.findMany({
      where: {
        id: {
          in: validated.map((b) => b.id),
        },
      },
    });

    return blocks;
  }

  async updateBlock(data: UpdateBlockDto, userId: string) {
    const validated = this.validationService.validate(updateBlockSchema, data);

    const block = await this.prismaService.block.findUnique({
      where: { id: validated.id },
      include: { note: true },
    });

    if (!block) throw new NotFoundException("Block not found");
    await this.validateNoteOwnership(block.note_id, userId);

    const updatedBlock = await this.prismaService.block.update({
      where: { id: validated.id },
      data: {
        parent_id: validated.parent_id ?? block.parent_id,
        type: validated.type ?? block.type,
        content: validated.content ?? block.content,
        props: {
          toJSON: () => validated.props ?? block.props,
        },
        position: validated.position ?? block.position,
      },
    });

    return updatedBlock;
  }

  async updateManyBlocks(data: UpdateBlockDto[], userId: string) {
    const validated = this.validationService.validate(
      z.array(updateBlockSchema),
      data,
    );

    await this.validateNoteOwnership(data[0].note_id, userId);

    const updatedBlocks = await this.prismaService.$transaction(
      validated.map((blockDto) =>
        this.prismaService.block.update({
          where: { id: blockDto.id },
          data: {
            parent_id: blockDto.parent_id,
            type: blockDto.type,
            content: blockDto.content,
            props: blockDto.props,
            position: blockDto.position,
          },
        }),
      ),
    );

    return updatedBlocks;
  }

  async deleteBlock(id: string, userId: string) {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { note: true },
    });

    if (!block) throw new NotFoundException("Block not found");
    if (block.note.user_id !== userId)
      throw new ForbiddenException("You do not have access to this block");

    await this.prismaService.$transaction([
      this.prismaService.block.deleteMany({ where: { parent_id: id } }),
      this.prismaService.block.delete({ where: { id } }),
    ]);

    this.server?.to(`note-${block.note_id}`).emit("blockDeleted", {
      id,
      noteId: block.note_id,
    });

    return true;
  }

  async deleteManyBlocks(ids: string[], userId: string) {
    const blocks = await this.prismaService.block.findFirst({
      where: { id: { in: ids } },
      include: {
        note: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!blocks) throw new NotFoundException("Block not found");

    await this.validateNoteOwnership(blocks.note_id, userId);

    await this.prismaService.block.deleteMany({ where: { id: { in: ids } } });

    return ids;
  }

  async reorderBlocks(data: ReorderBlockDto, userId: string) {
    this.validationService.validate(reorderBlocksSchema, data);

    if (data.length === 0) return true;

    const noteId = (
      await this.prismaService.block.findUnique({
        where: { id: data[0].id },
        include: { note: true },
      })
    )?.note.id;

    if (!noteId) throw new NotFoundException("Note not found");

    await this.validateNoteOwnership(noteId, userId);

    await this.prismaService.$transaction(
      data.map((block) =>
        this.prismaService.block.update({
          where: { id: block.id },
          data: {
            position: block.position,
            parent_id: block.parentId ?? undefined,
          },
        }),
      ),
    );

    return data;
  }

  async findByNoteId(noteId: string, userId: string) {
    await this.validateNoteOwnership(noteId, userId);

    return this.prismaService.block.findMany({
      where: { note_id: noteId },
      orderBy: { position: "asc" },
    });
  }

  handleConnection(client: Socket, noteId: string, userId: string) {
    this.server?.to(`note-${noteId}`).emit("userJoined", {
      userId,
      clientId: client.id,
    });
  }

  handleDisconnection(client: Socket, noteId: string, userId: string) {
    this.server?.to(`note-${noteId}`).emit("userLeft", {
      userId,
      clientId: client.id,
    });
  }
}
