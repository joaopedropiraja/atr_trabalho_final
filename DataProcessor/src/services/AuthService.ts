import { Service } from "typedi";
import { UserService } from "../services/UserService";
import { IUser } from "../models/User";
import { UnauthorizedError } from "routing-controllers";
import { HashService } from "./HashService";
import { JwtService } from "./JwtService";

@Service()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly accessTokenJwtService: JwtService
  ) {}

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userService.getByEmail(email, true);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await this.hashService.comparePassword(
      password,
      user.password as string
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = this.accessTokenJwtService.generateToken({
      userId: user.id,
    });

    return { token };
  }
}
