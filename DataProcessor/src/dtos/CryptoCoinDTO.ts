import { IsDefined, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCryptoDTO {
  @IsDefined({ always: true })
  @IsString()
  name!: string;

  @IsDefined({ always: true })
  @IsString()
  symbol!: string;

  @IsDefined({ always: true })
  image!: {
    thumb: string;
    small: string;
    large: string;
  };

  @IsDefined({ always: true })
  @IsNumber()
  dataInterval!: number;
}

export class UpdateCryptoDTO {
  @IsString()
  name?: string;

  @IsString()
  symbol?: string;

  image?: {
    thumb: string;
    small: string;
    large: string;
  };

  @IsNumber()
  dataInterval?: number;
}

export class CryptoCoinDetails {
  constructor(
    public readonly code: string,
    public readonly dataInterval: number
  ) {}
}
