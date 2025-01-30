import { Service } from "typedi";
import { JsonController, Post, Body, HttpCode } from "routing-controllers";
import { AuthService } from "../services/AuthService";
import { HTTP_CODES } from "../config/constants";
import { LoginDTO } from "../dtos/LoginDTO";

@JsonController("/auth")
@Service()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  @HttpCode(HTTP_CODES.OK)
  async login(@Body() credentials: LoginDTO) {
    return this.authService.login(credentials.email, credentials.password);
  }
}
