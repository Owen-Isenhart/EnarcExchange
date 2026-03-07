/**
 * MultiOutcomePriceChart Component - Display price history for all outcomes
 */

'use client';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface OutcomeData {
  id: number;
  description: string;
  prices: Array<{
    id: number;
    outcome_id: number;
    price: number;
    created_at: string;
  }>;
}

interface MultiOutcomePriceChartProps {
  marketName: string;
  outcomes: OutcomeData[];
  isLoading?: boolean;
}

// Color palette for multiple outcomes
const COLORS = [
  '#00FF41', // Neon green
  '#FF6B35', // Coral
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#C7CEEA', // Lavender
];

export const MultiOutcomePriceChart = ({
  marketName,
  outcomes,
  isLoading = false,
}: MultiOutcomePriceChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-white/70">Loading price history...</p>
        </CardContent>
      </Card>
    );
  }

  if (!outcomes || outcomes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-white/70">No price history available</p>
        </CardContent>
      </Card>
    );
  }

  // Find max length for alignment
  const maxLength = Math.max(...outcomes.map((o) => o.prices.length || 0));

  if (maxLength === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-white/70">No price data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Create time-aligned data for all outcomes
  // Get all unique timestamps from all outcomes
  const allTimestamps = new Set<string>();
  outcomes.forEach((outcome) => {
    outcome.prices.forEach((price) => {
      allTimestamps.add(price.created_at);
    });
  });

  const sortedTimestamps = Array.from(allTimestamps).sort();

  // Build chart data with all outcomes
  const chartData = sortedTimestamps.map((timestamp, idx) => {
    const dataPoint: any = {
      time: idx,
      timestamp: new Date(timestamp).toLocaleTimeString(),
    };

    outcomes.forEach((outcome) => {
      const price = outcome.prices.find((p) => p.created_at === timestamp);
      if (price) {
        dataPoint[`outcome_${outcome.id}`] = parseFloat((price.price * 100).toFixed(2));
      }
    });

    return dataPoint;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{marketName} - Market Odds</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
              interval={Math.max(0, Math.floor(chartData.length / 10))}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'Probability %', angle: -90, position: 'insideLeft' }}
              tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#050505',
                border: '1px solid #00FF41',
                borderRadius: '6px',
              }}
              formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(2) : value}%`}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {outcomes.map((outcome, idx) => (
              <Line
                key={outcome.id}
                type="monotone"
                dataKey={`outcome_${outcome.id}`}
                stroke={COLORS[idx % COLORS.length]}
                dot={false}
                name={outcome.description}
                isAnimationActive={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
