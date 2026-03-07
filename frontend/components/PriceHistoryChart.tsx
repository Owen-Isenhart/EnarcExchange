/**
 * PriceHistoryChart Component - Display price history across outcomes
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

interface PriceHistoryChartProps {
  outcomeId: number;
  outcomeName: string;
  data: Array<{
    id: number;
    outcome_id: number;
    price: number;
    created_at: string;
  }>;
  isLoading?: boolean;
}

export const PriceHistoryChart = ({
  outcomeId,
  outcomeName,
  data,
  isLoading = false,
}: PriceHistoryChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-white/70">Loading price history...</p>
        </CardContent>
      </Card>
    );
  }

  // Ensure data is an array before processing
  const dataArray = Array.isArray(data) ? data : [];

  if (!dataArray || dataArray.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-white/70">No price history available</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart - reverse order so newest is on the right
  const chartData = [...dataArray]
    .reverse()
    .map((item, index) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price as any) || 0;
      return {
        time: index,
        price: (price * 100).toFixed(2),
        timestamp: new Date(item.created_at).toLocaleTimeString(),
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{outcomeName} - Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
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
              formatter={(value: any) => `${value}%`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#00FF41"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
