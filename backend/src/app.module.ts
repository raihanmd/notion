import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [CommonModule, AuthModule, NotesModule],
})
export class AppModule {}
