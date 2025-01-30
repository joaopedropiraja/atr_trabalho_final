import jwt from "jsonwebtoken";
import { env } from "../config/envSchema";
import { Service } from "typedi";

@Service()
export class JwtService {
  constructor(
    private readonly secret: string = env.ACCESS_TOKEN_SECRET,
    private readonly expiresIn: number = env.ACCESS_TOKEN_EXPIRES_IN
  ) {}

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  async verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  }
}
