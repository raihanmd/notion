import * as chalk from "chalk";
import * as winston from "winston";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";

import { PrismaService } from "./prisma/prisma.service";
import { ValidationService } from "./validation/validation.service";
import { ResponseService } from "./response/response.service";
import { ErrorFilter } from "./error/error.filter";
import { JwtGuard } from "./guards/jwt.guard";
import { LoggingService } from "./logging/logging.service";
import { WinstonModule } from "nest-winston";

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.ms(),
        winston.format.timestamp({ format: "DD/MM/YYYY dddd HH:mm:ss" }),
        winston.format.printf((info) => {
          const level = winston.format
            .colorize()
            .colorize(info.level, `${info.level.toUpperCase()}`);
          const context = chalk.yellow(`[${info.context || "Application"}]`);
          const message = chalk.cyan(info.message);
          const ms = chalk.magenta(info.ms);
          return `${info.timestamp} ${level} ${context} : ${message} ${ms || ""}`;
        }),
      ),
      level: "debug",
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
        }),
      ],
    }),
  ],
  providers: [
    ValidationService,
    ResponseService,
    PrismaService,
    LoggingService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
  ],
  exports: [ValidationService, ResponseService, PrismaService, LoggingService],
})
export class CommonModule {}
