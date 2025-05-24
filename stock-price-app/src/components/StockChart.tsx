import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { api } from '../services/api';
import { StockPriceHistory, TimeInterval } from '../types';

const timeIntervals: TimeInterval[] = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
];

// Mock price history generator
function mockPriceHistory(symbol: string, minutes: number): StockPriceHistory {
  const now = new Date();
  const prices = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60000);
    prices.push({
      price: 100 + Math.random() * 20, // random price
      timestamp: date.toISOString(),
    });
  }
  return { symbol, prices };
}

export const StockChart: React.FC = () => {
  const [stocks, setStocks] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [data, setData] = useState<StockPriceHistory | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>(5);
  const [average, setAverage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [usedMock, setUsedMock] = useState<boolean>(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stockList = await api.getAvailableStocks();
        setStocks(stockList);
        if (stockList.length > 0) {
          setSelectedStock(stockList[0]);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    setLoading(true);
    setUsedMock(false);
    const fetchData = async () => {
      try {
        const result = await api.getStockPriceHistory(selectedStock, selectedInterval);
        // Robust: handle both array and object price history
        let prices: { price: number; timestamp: string }[] = [];
        if (Array.isArray(result.prices)) {
          prices = result.prices;
        } else if (typeof result.prices === 'object' && result.prices !== null) {
          prices = Object.entries(result.prices).map(([timestamp, price]) => ({
            price: Number(price),
            timestamp,
          }));
        }
        setData({ symbol: result.symbol, prices });
        const avg = prices.length > 0 ? prices.reduce((a, b) => a + b.price, 0) / prices.length : 0;
        setAverage(avg);
      } catch (error) {
        // Use mock data if API fails
        const mock = mockPriceHistory(selectedStock, selectedInterval);
        setData(mock);
        setAverage(
          mock.prices.length > 0
            ? mock.prices.reduce((a, b) => a + b.price, 0) / mock.prices.length
            : 0
        );
        setUsedMock(true);
        console.error('Error fetching stock data, using mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedStock, selectedInterval]);

  return (
    <Box sx={{ width: '100%', height: 400, p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Stock</InputLabel>
          <Select
            value={selectedStock}
            label="Stock"
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            {stocks.map((symbol) => (
              <MenuItem key={symbol} value={symbol}>
                {symbol}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Interval</InputLabel>
          <Select
            value={selectedInterval}
            label="Time Interval"
            onChange={(e) => setSelectedInterval(Number(e.target.value))}
          >
            {timeIntervals.map((interval) => (
              <MenuItem key={interval.value} value={interval.value}>
                {interval.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : data && data.prices.length > 0 ? (
        <>
          {usedMock && (
            <Typography color="warning.main" sx={{ mb: 1 }}>
              Showing mock data (API unavailable)
            </Typography>
          )}
          <ResponsiveContainer>
            <LineChart data={data.prices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                name="Stock Price"
              />
              <Line
                type="monotone"
                dataKey={() => average}
                stroke="#82ca9d"
                strokeDasharray="5 5"
                name="Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <Typography>No data available for this stock.</Typography>
      )}
    </Box>
  );
}; 