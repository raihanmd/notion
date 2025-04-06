import { ResponseService } from "src/common/response/response.service";
// blocks.controller.ts
import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  Patch,
} from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { UpdateBlockDto } from "./dto/update-block.dto";
import { CreateBlockDto } from "./dto/create-block.dto";
import { ReorderBlockDto } from "./dto/reorder-block.dto";

@Controller("blocks")
export class BlocksController {
  constructor(
    private readonly blocksService: BlocksService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(200)
  @Post()
  async createBlock(@Body() data: CreateBlockDto, @Req() req: any) {
    const res = await this.blocksService.createBlock(data, req.user.id);
    return this.responseService.success({
      payload: res,
      message: "Block created successfully",
    });
  }

  @HttpCode(200)
  @Patch(":id")
  async updateBlock(@Body() data: UpdateBlockDto, @Req() req: any) {
    const res = await this.blocksService.updateBlock(data, req.user.id);
    return this.responseService.success({
      payload: res,
      message: "Block updated successfully",
    });
  }

  @HttpCode(200)
  @Delete(":id")
  async deleteBlock(@Param("id") id: string, @Req() req: any) {
    await this.blocksService.deleteBlock(id, req.user.id);
    return this.responseService.successMessage("Block deleted successfully");
  }

  @HttpCode(200)
  @Post("reorder")
  async reorderBlocks(@Body() data: ReorderBlockDto, @Req() req: any) {
    await this.blocksService.reorderBlocks(data, req.user.id);
    return this.responseService.successMessage("Blocks reordered successfully");
  }
}
