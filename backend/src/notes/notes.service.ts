import { Injectable } from "@nestjs/common";
import { CreateNoteDto, createNoteSchema } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { ValidationService } from "src/common/validation/validation.service";
import { PrismaService } from "src/common/prisma/prisma.service";

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
        content: newNote.content,
        user_id: userId,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prismaService.note.findMany({
      where: { user_id: userId, deleted_at: null, is_archived: false },
      orderBy: { created_at: "desc" },
    });
  }

  async findOne(noteId: string, userId: string) {
    return await this.prismaService.note.findUnique({
      where: {
        id: noteId,
        user_id: userId,
        deleted_at: null,
        is_archived: false,
      },
    });
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
