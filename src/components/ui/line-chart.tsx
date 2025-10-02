"use client";
import React from 'react';

interface LineChartDataPoint {
  x: string | number;
  y: number;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  strokeColor?: string;
  formatY?: (value: number) => string;
  formatX?: (value: string | number) => string;
}

export function LineChart({
  title,
  data,
  className = "",
  height = 300,
  strokeColor = "#3B82F6",
  formatY = (value) => value.toLocaleString(),
  formatX = (value) => String(value),
}: LineChartProps) {

  if (!data || data.length < 2) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-gray-400">Not enough data to display chart</p>
        </div>
      </div>
    );
  }

  const padding = { top: 40, right: 30, bottom: 40, left: 60 };
  const chartWidth = 500;
  const chartHeight = height;
  
  const yMax = Math.max(...data.map(d => d.y));
  const yMin = 0; // Assuming y-axis starts at 0

  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
  const yScale = (y: number) => chartHeight - padding.bottom - ((y - yMin) / (yMax - yMin)) * (chartHeight - padding.top - padding.bottom);

  const pathData = data.map((point, i) => {
    const x = xScale(i);
    const y = yScale(point.y);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  const yAxisLabels = () => {
    const labels = [];
    for (let i = 0; i <= 4; i++) {
      const value = yMin + (yMax - yMin) * (i / 4);
      labels.push({
        value: formatY(value),
        y: yScale(value),
      });
    }
    return labels;
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={height}>
          {/* Y-axis grid lines and labels */}
          {yAxisLabels().map((label, i) => (
            <g key={i} className="text-gray-500">
              <line
                x1={padding.left}
                y1={label.y}
                x2={chartWidth - padding.right}
                y2={label.y}
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 8}
                y={label.y}
                dy="0.32em"
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
              >
                {label.value}
              </text>
            </g>
          ))}
          
          {/* X-axis labels */}
          {data.map((point, i) => {
             if (i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1) return null;
            return (
                <text
                    key={i}
                    x={xScale(i)}
                    y={chartHeight - padding.bottom + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    className="text-gray-400"
                >
                    {formatX(point.x)}
                </text>
            )
          })}

          {/* Line path */}
          <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2" />

          {/* Data points */}
          {data.map((point, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={yScale(point.y)}
              r="3"
              fill={strokeColor}
              className="transition-transform duration-200 hover:scale-150"
            >
              <title>{`${formatX(point.x)}: ${formatY(point.y)}`}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}
