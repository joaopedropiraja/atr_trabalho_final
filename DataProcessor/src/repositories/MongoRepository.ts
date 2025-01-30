import { Model, Document } from "mongoose";

export class MongoRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async get(
    page: number = 1,
    limit: number = 0
  ): Promise<{ data: T[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find().skip(skip).limit(limit).exec(),
      this.model.countDocuments(),
    ]);
    return { data, total };
  }

  async getBy(query: object): Promise<T[]> {
    return this.model.find(query).exec();
  }

  async getById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async getOneBy(query: object): Promise<T | null> {
    return this.model.findOne(query).exec();
  }

  async create(data: T): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, update: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
