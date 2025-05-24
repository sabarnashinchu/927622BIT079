import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { api } from '../services/api';
import { CorrelationData, TimeInterval } from '../types';

const timeIntervals: TimeInterval[] = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
];

export const CorrelationHeatmap: React.FC = () => {
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<number>(5);
  const [stocks, setStocks] = useState<string[]>([]);
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [correlationResult, availableStocks] = await Promise.all([
          api.getCorrelationData(selectedInterval),
          api.getAvailableStocks(),
        ]);
        setCorrelationData(correlationResult);
        setStocks(availableStocks);
      } catch (error) {
        console.error('Error fetching correlation data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedInterval]);

  const getCorrelationColor = (correlation: number) => {
    const hue = correlation > 0 ? 120 : 0; // Green for positive, Red for negative
    const saturation = Math.abs(correlation) * 100;
    return `hsl(${hue}, ${saturation}%, 50%)`;
  };

  const getCorrelationValue = (stock1: string, stock2: string) => {
    const correlation = correlationData.find(
      (c) => (c.stock1 === stock1 && c.stock2 === stock2) || (c.stock1 === stock2 && c.stock2 === stock1)
    );
    return correlation?.correlation || 0;
  };

  return (
    <Box sx={{ p: 2 }}>
      <FormControl sx={{ mb: 2, minWidth: 120 }}>
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

      <Paper sx={{ p: 2, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ width: 100 }} /> {/* Spacer for alignment */}
            {stocks.map((stock) => (
              <Typography
                key={stock}
                sx={{
                  width: 60,
                  textAlign: 'center',
                  fontWeight: hoveredStock === stock ? 'bold' : 'normal',
                }}
                onMouseEnter={() => setHoveredStock(stock)}
                onMouseLeave={() => setHoveredStock(null)}
              >
                {stock}
              </Typography>
            ))}
          </Box>

          {stocks.map((stock1) => (
            <Box key={stock1} sx={{ display: 'flex', gap: 1 }}>
              <Typography
                sx={{
                  width: 100,
                  fontWeight: hoveredStock === stock1 ? 'bold' : 'normal',
                }}
                onMouseEnter={() => setHoveredStock(stock1)}
                onMouseLeave={() => setHoveredStock(null)}
              >
                {stock1}
              </Typography>
              {stocks.map((stock2) => {
                const correlation = getCorrelationValue(stock1, stock2);
                return (
                  <Tooltip
                    key={`${stock1}-${stock2}`}
                    title={`Correlation: ${correlation.toFixed(2)}`}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        bgcolor: getCorrelationColor(correlation),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        opacity: hoveredStock && (hoveredStock === stock1 || hoveredStock === stock2) ? 1 : 0.7,
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography>Correlation Legend:</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 20, height: 20, bgcolor: 'hsl(0, 100%, 50%)' }} />
          <Typography>Strong Negative</Typography>
          <Box sx={{ width: 20, height: 20, bgcolor: 'hsl(0, 0%, 50%)' }} />
          <Typography>No Correlation</Typography>
          <Box sx={{ width: 20, height: 20, bgcolor: 'hsl(120, 100%, 50%)' }} />
          <Typography>Strong Positive</Typography>
        </Box>
      </Box>
    </Box>
  );
}; 