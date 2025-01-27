import { Service } from "typedi";
import { MongoRepository } from "./MongoRepository";
import { IUser, User } from "../models/User";

@Service()
export class UserRepository extends MongoRepository<IUser> {
  constructor() {
    super(User);
  }
}
