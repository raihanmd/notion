import { Injectable, LoggerService } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class LoggingService implements LoggerService {
  private context = "Default";

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  initiate(serviceName: string) {
    this.context = serviceName;
  }

  log(message: any) {
    this.logger.info(message, { context: this.context });
  }

  error(message: any, trace?: any) {
    this.logger.error(message, { context: this.context, trace });
  }

  warn(message: any) {
    this.logger.warn(message, { context: this.context });
  }
}
