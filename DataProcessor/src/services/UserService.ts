import { Service } from "typedi";
import { IUser } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";
import { HashService } from "./HashService";

@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService
  ) {}

  async get(
    page: number = 1,
    limit: number = 0,
    query: object = {}
  ): Promise<{ data: IUser[]; total: number }> {
    const { data, total } = await this.userRepository.get(page, limit, query);
    data.forEach((user) => (user.password = undefined));

    return { data, total };
  }

  async getById(id: string): Promise<IUser | null> {
    const user = await this.userRepository.getById(id);
    if (!!user) {
      user.password = undefined;
    }

    return user;
  }

  async getByEmail(email: string): Promise<IUser | null> {
    const user = await this.userRepository.getOneBy({ email });
    if (!!user) {
      user.password = undefined;
    }

    return user;
  }

  async create(user: IUser): Promise<IUser> {
    user.password = await this.hashService.hashPassword(user?.password || "");

    const createdUser = await this.userRepository.create(user);
    createdUser.password = undefined;

    return createdUser;
  }

  async update(id: string, update: Partial<IUser>): Promise<IUser | null> {
    return this.userRepository.update(id, update);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
