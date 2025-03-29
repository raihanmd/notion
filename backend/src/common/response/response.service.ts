import { Injectable } from "@nestjs/common";

@Injectable()
export class ResponseService {
  success(payload: any) {
    return {
      payload,
    };
  }

  pagination(payload: any, meta: any) {
    return {
      payload,
      meta,
    };
  }
}
