import bcrypt from "bcrypt";
import { Service } from "typedi";

@Service()
export class HashService {
  private readonly saltRounds: number = 10;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
