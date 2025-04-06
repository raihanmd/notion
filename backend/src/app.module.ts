import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";
import { NotesModule } from "./notes/notes.module";
import { BlocksModule } from "./blocks/blocks.module";

@Module({
  imports: [CommonModule, AuthModule, NotesModule, BlocksModule],
})
export class AppModule {}
