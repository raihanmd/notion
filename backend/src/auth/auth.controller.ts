import { Body, Controller, HttpCode, Post } from "@nestjs/common";

import { ResponseService } from "src/common/response/response.service";
import { Public } from "src/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginUserDto, RegisterUserDto } from "./dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @HttpCode(201)
  @Public()
  @Post("/register")
  async register(@Body() loginReq: RegisterUserDto) {
    const res = await this.authService.register(loginReq);
    return this.responseService.success(res);
  }

  @HttpCode(200)
  @Public()
  @Post("/login")
  async login(@Body() loginReq: LoginUserDto) {
    const res = await this.authService.login(loginReq);
    return this.responseService.success(res);
  }

  // @HttpCode(200)
  // @Get("/arsip-negara")
  // async secret(@Req() req: any) {
  //   return { req: JSON.stringify(req?.user) };
  // }

  // @HttpCode(200)
  // @Get("/public")
  // @Public()
  // async public() {
  //   return { hello: `world public` };
  // }
}
