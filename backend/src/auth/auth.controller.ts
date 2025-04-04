import { ConfigService } from "@nestjs/config";
import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";

import { ResponseService } from "src/common/response/response.service";
import { Public } from "src/common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginUserDto, RegisterUserDto } from "./dto";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(200)
  @Public()
  @Post("/register")
  async register(@Body() loginReq: RegisterUserDto, @Res() res: Response) {
    const data = await this.authService.register(loginReq);
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "strict",
    });
    return res.json(
      this.responseService.success({
        payload: data,
        message: "Register Success",
      }),
    );
  }

  @HttpCode(200)
  @Public()
  @Post("/login")
  async login(@Body() loginReq: LoginUserDto, @Res() res: Response) {
    const data = await this.authService.login(loginReq);
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "strict",
    });
    return res.json(
      this.responseService.success({
        payload: data,
        message: "Login Success",
      }),
    );
  }

  @HttpCode(200)
  @Post("/logout")
  async logout(@Res() res: Response) {
    const data = await this.authService.logout(res);
    return res.json(this.responseService.successMessage("Logout Success"));
  }
}
