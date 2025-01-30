import { IsDefined, IsEmail, IsString } from "class-validator";

export class CreateUserDTO {
  @IsDefined({ always: true })
  @IsString()
  name!: string;

  @IsDefined({ always: true })
  @IsEmail()
  @IsString()
  email!: string;

  @IsDefined({ always: true })
  @IsString()
  password!: string;

  isAdmin: boolean = false;
}

export class UpdateUserDTO {
  @IsString()
  name?: string;

  @IsEmail()
  @IsString()
  email?: string;

  @IsString()
  password?: string;
}
