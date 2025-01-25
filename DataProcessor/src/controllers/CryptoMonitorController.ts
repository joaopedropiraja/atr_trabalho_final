import { IsEmail, isNotEmpty, MinLength } from "class-validator";
import { JsonController, Get, Param, Post, Body } from "routing-controllers";
import { Service } from "typedi";

class User {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
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
  async updateCryptoPrice(
    @Body({ validate: true, required: true }) user: User
  ) {
    return { user };
    // return this.cryptoService.updateCryptoPrice(body.symbol, body.priceBRL);
  }
}
