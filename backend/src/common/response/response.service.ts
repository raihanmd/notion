import { Injectable } from "@nestjs/common";

@Injectable()
export class ResponseService {
  successMessage(message: string) {
    return {
      message,
    };
  }

  success({ payload, message }: { payload: any; message: string }) {
    return {
      message,
      payload,
    };
  }
}
