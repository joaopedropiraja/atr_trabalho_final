import { Service } from "typedi";
import { MongoRepository } from "./MongoRepository";
import { IAlert, Alert } from "../models/Alert";

@Service()
export class AlertRepository extends MongoRepository<IAlert> {
  constructor() {
    super(Alert);
  }
}
