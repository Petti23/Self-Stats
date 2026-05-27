/* ============================================================
   StatGauge — Semi-circular progress ring for AVG/OBP
   ============================================================ */

import React, { useEffect, useState } from 'react';
import { formatAvg } from '../stats';

interface StatGaugeProps {
  value: number;       // 0–1 range (or higher)
  label: string;
  maxValue?: number;   // Scale reference (default 0.500 for AVG)
  colorFrom?: string;
  colorTo?: string;
  size?: number;
}

const StatGauge: React.FC<StatGaugeProps> = ({
  value,
  label,
  maxValue = 0.500,
  colorFrom = '#10b981',
  colorTo = '#34d399',
  size = 140,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semi-circle arc (180 degrees, from left to right at bottom)
  const circumference = Math.PI * radius;
  const percent = Math.min(animatedValue / maxValue, 1);
  const dashOffset = circumference * (1 - percent);

  const gradientId = `gauge-grad-${label.replace(/\s/g, '')}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            className="stat-gauge-bg"
            strokeWidth={strokeWidth}
          />
          {/* Filled arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            className="stat-gauge-fill"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        {/* Center value */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ paddingBottom: '8px' }}
        >
          <span className="stat-number text-3xl font-black text-text-primary">
            {formatAvg(animatedValue)}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </span>
    </div>
  );
};

export default StatGauge;

