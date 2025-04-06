import { Module } from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { BlocksGateway } from "./blocks.gateway";
import { BlocksController } from "./blocks.controller";

@Module({
  controllers: [BlocksController],
  providers: [BlocksGateway, BlocksService],
})
export class BlocksModule {}
