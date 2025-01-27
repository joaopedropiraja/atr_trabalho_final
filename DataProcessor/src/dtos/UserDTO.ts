import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDTO {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;

  isAdmin: boolean = false;
}

export class UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}
