import { IsDefined, IsEmail, IsString } from "class-validator";

export class LoginDTO {
  @IsDefined({ always: true })
  @IsEmail()
  @IsString()
  email!: string;

  @IsDefined({ always: true })
  @IsString()
  password!: string;
}
