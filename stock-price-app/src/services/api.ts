import axios from 'axios';
import { StockData, StockPriceHistory, CorrelationData } from '../types';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDcyNzkxLCJpYXQiOjE3NDgwNzI0OTEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjQzNmY4NTEwLThhNzQtNGVkMi04NDZiLTk2ZDRjODk2ZjJjOSIsInN1YiI6InNhYmFybmFzaGluY2h1QGdtYWlsLmNvbSJ9LCJlbWFpbCI6InNhYmFybmFzaGluY2h1QGdtYWlsLmNvbSIsIm5hbWUiOiJzYWJhcm5hIHQiLCJyb2xsTm8iOiI5Mjc2MjJiaXQwNzkiLCJhY2Nlc3NDb2RlIjoid2hlUVV5IiwiY2xpZW50SUQiOiI0MzZmODUxMC04YTc0LTRlZDItODQ2Yi05NmQ0Yzg5NmYyYzkiLCJjbGllbnRTZWNyZXQiOiJ1Y3dWTURGeFhSWWFZekRzIn0.r06oLfz9GOx_iRd3sZRGl06b4q8nOFaSF_I1jrxvo7g';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

export const api = {
  getStockPriceHistory: async (symbol: string, minutes: number): Promise<StockPriceHistory> => {
    const response = await axiosInstance.get(`/stocks/${symbol}/history`, {
      params: { minutes }
    });
    return response.data;
  },

  getCorrelationData: async (minutes: number): Promise<CorrelationData[]> => {
    const response = await axiosInstance.get(`/correlation`, {
      params: { minutes }
    });
    return response.data;
  },

  getAvailableStocks: async (): Promise<string[]> => {
    const response = await axiosInstance.get(`/stocks`);
    // The API returns { stocks: { ... } }
    // We want only the symbol values
    return Object.values(response.data.stocks);
  }
}; 