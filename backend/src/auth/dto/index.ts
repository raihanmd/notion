export class LoginUserDto {
  username!: string;

  password!: string;
}

export class RegisterUserDto extends LoginUserDto {}
