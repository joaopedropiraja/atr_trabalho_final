export type CryptoCoinPrice = {
  cryptoCoin: string;
  value: number;
  timestamp: Date;
};

export type CryptoCoin = {
  id: string;
  name: string;
  symbol: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  lastPrice: CryptoCoinPrice;
  percentageChange1h: number;
};

export type CryptoCoinAllData = {
  id: string;
  name: string;
  symbol: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  lastPrice: CryptoCoinPrice;
  prices: CryptoCoinPrice[];
  metrics: {
    label: string;
    movingAverage: number | null;
    percentageChange: number | null;
  }[];
};
