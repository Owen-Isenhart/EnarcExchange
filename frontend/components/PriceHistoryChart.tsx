/**
 * PriceHistoryChart Component - Display price history across outcomes
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [isDark, setIsDark] = useState(true);

  // Detect theme on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const chartColors = useMemo(() => ({
    bg: isDark ? '#0a0a0a' : '#f9fafb',
    line: isDark ? '#00ff41' : '#154734',
    text: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    border: isDark ? '#00ff41' : '#154734',
  }), [isDark]);
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-secondary">Loading price history...</p>
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
          <p className="text-secondary">No price history available</p>
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: chartColors.text, fontSize: 12 }}
              interval={Math.max(0, Math.floor(chartData.length / 10))}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: 'Probability %', angle: -90, position: 'insideLeft', fill: chartColors.text }}
              tick={{ fill: chartColors.text, fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.bg,
                border: `1px solid ${chartColors.border}`,
                borderRadius: '6px',
                color: chartColors.text,
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={chartColors.line}
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
