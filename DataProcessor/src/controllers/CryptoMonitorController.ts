import { JsonController, Get, Param, Post, Body } from "routing-controllers";
import { Service } from "typedi";

interface PriceDTO {
  symbol: string;
  priceBRL: number;
}

@Service()
@JsonController("/crypto")
export class CryptoMonitorController {
  constructor() {}

  @Get("/:symbol")
  async getCryptoPrice(@Param("symbol") symbol: string) {
    return { symbol };
    // return this.cryptoService.getLatestCryptoPrice(symbol);
  }

  @Post("/")
  async updateCryptoPrice(@Body() body: PriceDTO) {
    // return this.cryptoService.updateCryptoPrice(body.symbol, body.priceBRL);
  }
}
