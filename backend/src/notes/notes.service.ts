import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateNoteDto, createNoteSchema } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { ValidationService } from "src/common/validation/validation.service";
import { PrismaService } from "src/common/prisma/prisma.service";
import { QueryParamsNoteDto } from "./dto/search-note-dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class NotesService {
  constructor(
    private readonly validationService: ValidationService,
    private readonly prismaService: PrismaService,
  ) {}

  async create(data: CreateNoteDto, userId: string) {
    const newNote = this.validationService.validate(createNoteSchema, data);

    return await this.prismaService.note.create({
      data: {
        title: newNote.title,
        user_id: userId,
      },
    });
  }

  async findAll(userId: string, data: QueryParamsNoteDto) {
    const filter: Prisma.NoteWhereInput = {};

    if (data.search)
      filter.title = {
        contains: decodeURIComponent(data.search),
        mode: "insensitive",
      };

    return await this.prismaService.note.findMany({
      where: {
        ...filter,
        user_id: userId,
        deleted_at: null,
        is_archived: false,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async findOne(noteId: string, userId: string) {
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
        user_id: userId,
        deleted_at: null,
        is_archived: false,
      },
      include: {
        blocks: true,
      },
    });

    if (!note) throw new NotFoundException("Note not founr");

    return note;
  }

  async update(noteId: string, userId: string, updateNoteDto: UpdateNoteDto) {
    return await this.prismaService.note.update({
      where: { id: noteId, user_id: userId },
      data: updateNoteDto,
    });
  }

  async remove(noteId: string, userId: string) {
    await this.prismaService.note.update({
      where: { id: noteId, user_id: userId },
      data: { deleted_at: new Date() },
    });

    return "Note deleted successfully";
  }
}
