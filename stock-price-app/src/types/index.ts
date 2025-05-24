export interface StockData {
  symbol: string;
  price: number;
  timestamp: string;
}

export interface StockPriceHistory {
  symbol: string;
  prices: {
    price: number;
    timestamp: string;
  }[];
}

export interface CorrelationData {
  stock1: string;
  stock2: string;
  correlation: number;
}

export interface TimeInterval {
  label: string;
  value: number; // in minutes
} 