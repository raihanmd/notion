import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpCode,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { ResponseService } from "src/common/response/response.service";

@Controller("notes")
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(201)
  @Post()
  async create(@Body() createNoteDto: CreateNoteDto, @Req() req: any) {
    const res = await this.notesService.create(createNoteDto, req.user.id);

    return this.responseService.success(res);
  }

  @HttpCode(200)
  @Get()
  async findAll(@Req() req: any) {
    const res = await this.notesService.findAll(req.user.id);

    return this.responseService.success(res);
  }

  @HttpCode(200)
  @Get(":id")
  findOne(@Param("id") id: string, @Req() req: any) {
    const res = this.notesService.findOne(id, req.user.id);

    return this.responseService.success(res);
  }

  @HttpCode(200)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Req() req: any,
  ) {
    const res = await this.notesService.update(id, req.user.id, updateNoteDto);

    return this.responseService.success(res);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: any) {
    const res = await this.notesService.remove(id, req.user.id);

    return this.responseService.success(res);
  }
}
