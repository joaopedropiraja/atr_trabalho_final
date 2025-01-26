import { IsNotEmpty } from "class-validator";

export class CreateCryptoDTO {
  @IsNotEmpty()
  name!: string;
  @IsNotEmpty()
  symbol!: string;
  @IsNotEmpty()
  image!: {
    thumb: string;
    small: string;
    large: string;
  };
  @IsNotEmpty()
  dataInterval!: number;
}

export class UpdateCryptoDTO {
  name?: string;
  symbol?: string;
  image?: {
    thumb: string;
    small: string;
    large: string;
  };
  dataInterval?: number;
}

export class CryptoCoinDetails {
  constructor(
    public readonly code: string,
    public readonly dataInterval: number
  ) {}
}
