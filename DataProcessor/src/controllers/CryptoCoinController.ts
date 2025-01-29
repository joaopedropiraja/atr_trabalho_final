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
import { CreateCryptoDTO, UpdateCryptoDTO } from "../dtos/CryptoCoinDTO";
import { CryptoCoin } from "../models/CryptoCoin";
import { CryptoCoinService } from "../services/CryptoCoinService";
import { HTTP_CODES } from "../config/constants";

@JsonController("/crypto-coins", { transformResponse: false })
@Service()
export class CryptoCoinController {
  constructor(private readonly cryptoCoinService: CryptoCoinService) {}

  @Get("/")
  async getCrypto() {
    return this.cryptoCoinService.getAll();
  }

  @Get("/:id/prices-metrics")
  async getCryptoWithPrices(
    @Param("id") id: string,
    @QueryParam("metricLabel") metricLabel: string
  ) {
    return this.cryptoCoinService.getByIdWithPricesAndMetrics(id, metricLabel);
  }

  @Get("/:symbol")
  async getCryptoBySymbol(@Param("symbol") symbol: string) {
    return this.cryptoCoinService.getBySymbol(symbol);
  }

  @Post("/")
  @HttpCode(HTTP_CODES.CREATED)
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
