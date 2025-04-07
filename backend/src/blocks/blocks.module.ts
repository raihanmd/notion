import { Module } from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { BlocksGateway } from "./blocks.gateway";

@Module({
  providers: [BlocksGateway, BlocksService],
})
export class BlocksModule {}
