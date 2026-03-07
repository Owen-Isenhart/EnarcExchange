/**
 * Market Gauge Card Component
 * Shows market with outcome options and probability gauge
 */

'use client';

import { useMarketPrices } from '@/hooks/useMarkets';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatting';
import { Calendar } from 'lucide-react';

interface MarketGaugeCardProps {
  market: any;
}

// Function to get color based on probability
const getGaugeColor = (percentage: number): string => {
  // We set the "Yellow" pivot point lower (e.g., 35%) 
  // so that by 50%, we are already moving into the green spectrum.
  const pivot = 35;

  let r: number, g: number, b: number = 0;

  if (percentage <= pivot) {
    // Phase 1: Red (#FF0000) to Yellow (#FFFF00)
    const ratio = percentage / pivot;
    r = 255;
    g = Math.round(255 * ratio);
  } else {
    // Phase 2: Yellow (#FFFF00) to Green (#00FF00)
    const ratio = (percentage - pivot) / (100 - pivot);
    r = Math.round(255 * (1 - ratio));
    g = 255;
  }

  const toHex = (num: number) => num.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const MarketGaugeCard = ({ market }: MarketGaugeCardProps) => {
  const { prices } = useMarketPrices(market.id);

  const yesProbability = prices.find((p: any) => p.description?.toLowerCase().includes('yes'))?.price || 0;
  const yesPercentage = Math.round(yesProbability * 100);
  const gaugeColor = getGaugeColor(yesPercentage);

  const gaugeData = [
    { name: 'Yes', value: yesPercentage },
    { name: 'No', value: 100 - yesPercentage },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
            {market.name}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2">
            {market.description}
          </p>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center">
          {/* Container matches PieChart dimensions exactly */}
          <div className="w-20 h-16 flex items-center justify-center relative overflow-hidden">
            <PieChart width={80} height={80} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={gaugeData}
                cx="50%" 
                cy="50%" // Centered at 40,40
                innerRadius={27}
                outerRadius={32}
                startAngle={180}
                endAngle={0}
                dataKey="value"
                stroke="none"
                isAnimationActive={false} // Prevents "jumpy" alignment during load
              >
                <Cell fill={gaugeColor} />
                <Cell fill="#333333" />
              </Pie>
            </PieChart>

            {/* Adjusted Text Position */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 text-center translate-y-[-20px]">
              <span className="text-xs font-bold leading-none" style={{ color: gaugeColor }}>
                {yesPercentage}%
              </span>
              <span className="text-[10px] text-white/50 leading-none">
                chance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ... (rest of the component: outcome buttons and footer) */}
      <div className="flex gap-2 mb-4 flex-shrink-0">
        <button className="flex-1 px-3 py-2 bg-[#00FF41]/10 border border-[#00FF41] text-[#00FF41] rounded text-sm font-medium hover:bg-[#00FF41]/20 transition-colors">
          Yes
        </button>
        <button className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500 text-red-400 rounded text-sm font-medium hover:bg-red-500/20 transition-colors">
          No
        </button>
      </div>

      <div className="text-xs text-white/50 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Created {formatDate(market.created_at)}</span>
        </div>
        
      </div>
    </div>
  );
};