import { BaseResponse } from "../../common/response/base-response";

class UserPayload {
  token!: string;
}

export class RegisterResponse extends BaseResponse<UserPayload> {
  payload!: UserPayload;
}

export class LoginResponse extends RegisterResponse {}
