import { Service } from "typedi";
import {
  JsonController,
  Get,
  Post,
  Param,
  Body,
  QueryParam,
  Delete,
  Put,
  HttpCode,
} from "routing-controllers";
import { UserService } from "../services/UserService";
import { HTTP_CODES } from "../config/constants";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/UserDTO";
import { User } from "../models/User";

@JsonController("/users", { transformResponse: false })
@Service()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/")
  async getPaginatedUsers(
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 10
  ) {
    return this.userService.get(page, limit);
  }

  @Get("/:id")
  async getUserById(@Param("id") id: string) {
    return this.userService.getById(id);
  }

  @Get("/:email/email")
  async getUserByEmail(@Param("email") email: string) {
    return this.userService.getByEmail(email);
  }

  @Post("/")
  @HttpCode(HTTP_CODES.CREATED)
  async createUser(@Body() data: CreateUserDTO) {
    const user = new User(data);

    return this.userService.create(user);
  }

  @Put("/:id")
  async updateUser(@Param("id") id: string, @Body() update: UpdateUserDTO) {
    return this.userService.update(id, update);
  }

  @Delete("/:id")
  async deleteUser(@Param("id") id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
