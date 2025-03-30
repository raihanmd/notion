import * as bcrypt from "bcrypt";
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { PrismaService } from "src/common/prisma/prisma.service";
import { ValidationService } from "src/common/validation/validation.service";
import { LoginUserDto, RegisterUserDto } from "./dto";
import { UsersValidation } from "./zod";
import { LoggingService } from "src/common/logging/logging.service";
import { Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly validationService: ValidationService,
  ) {
    loggingService.initiate("AuthService");
  }

  async register(data: RegisterUserDto) {
    const registerUser = this.validationService.validate(
      UsersValidation.RESGISTER,
      data,
    );

    const isUserExist = await this.prismaService.user.findFirst({
      where: {
        username: registerUser.username,
      },
    });

    if (isUserExist) throw new ForbiddenException("User already exist");

    registerUser.password = await bcrypt.hash(
      registerUser.password as string,
      10,
    );

    this.loggingService.log(`Register User: ${registerUser.username}`);

    const user = await this.prismaService.user.create({
      data: {
        username: registerUser.username as string,
        password: registerUser.password,
      },
      omit: {
        password: true,
      },
    });

    return {
      token: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
      id: user.id,
      username: user.username,
      image: user.image,
    };
  }

  async login(data: LoginUserDto) {
    const loginUser = this.validationService.validate(
      UsersValidation.LOGIN,
      data,
    );

    const user = await this.prismaService.user.findFirst({
      where: {
        username: loginUser.username,
      },
    });

    if (!user) throw new UnauthorizedException("Username or password wrong");

    const isMatch = await bcrypt.compare(
      loginUser.password as string,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException("Username or password wrong");

    this.loggingService.log(`Login User: ${user.username}`);

    return {
      token: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
      id: user.id,
      username: user.username,
      image: user.image,
    };
  }

  async logout(res: Response) {
    res.clearCookie("token");

    return {
      message: "Logout Success",
    };
  }
}
