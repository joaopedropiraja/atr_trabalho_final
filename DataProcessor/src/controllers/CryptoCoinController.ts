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
} from "routing-controllers";
import { CreateCryptoDTO, UpdateCryptoDTO } from "../dtos/CryptoCoinDTO";
import { CryptoCoin } from "../models/CryptoCoin";
import { CryptoCoinService } from "../services/CryptoCoinService";

@JsonController("/crypto-coins", { transformResponse: false })
@Service()
export class CryptoCoinController {
  constructor(private readonly cryptoCoinService: CryptoCoinService) {}

  @Get("/")
  async getPaginatedCrypto(
    @QueryParam("page") page: number = 1,
    @QueryParam("limit") limit: number = 0
  ) {
    return this.cryptoCoinService.get(page, limit);
  }

  @Get("/:symbol")
  async getCryptoBySymbol(@Param("symbol") symbol: string) {
    return this.cryptoCoinService.getBySymbol(symbol);
  }

  @Post("/")
  async createCrypto(@Body() data: CreateCryptoDTO) {
    const coin = new CryptoCoin(data);

    return this.cryptoCoinService.create(coin);
  }

  @Put("/:id")
  async updateCrypto(@Param("id") id: string, @Body() update: UpdateCryptoDTO) {
    return this.cryptoCoinService.update(id, update);
  }

  @Delete("/:id")
  async deleteCrypto(@Param("id") id: string): Promise<void> {
    await this.cryptoCoinService.delete(id);
  }
}
