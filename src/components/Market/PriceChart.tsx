import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MarketData } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { COLORS } from '../../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  marketData: MarketData | null;
}

const PriceChart: React.FC<PriceChartProps> = ({ marketData }) => {
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate price history data
  useEffect(() => {
    if (!marketData) return;

    setIsLoading(true);

    // Generate mock price history for the last 24 hours (48 data points, every 30 minutes)
    const history = [];
    const labels = [];
    const basePrice = marketData.currentPrice;

    for (let i = 47; i >= 0; i--) {
      const time = new Date(Date.now() - i * 30 * 60 * 1000);
      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Generate realistic price movement
      const volatility = (Math.random() - 0.5) * 0.1; // ±5% volatility
      const trend = Math.sin(i / 10) * 0.02; // Slight trending pattern
      const price = basePrice * (1 + volatility + trend);
      history.push(Math.max(0.01, price));
    }

    setPriceHistory(history);
    setTimeLabels(labels);
    setIsLoading(false);
  }, [marketData]);

  if (!marketData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No market data available</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Price',
        data: priceHistory,
        borderColor: marketData.trend === 'up' ? COLORS.success :
                    marketData.trend === 'down' ? COLORS.error : COLORS.textSecondary,
        backgroundColor: marketData.trend === 'up' ? COLORS.success + '20' :
                        marketData.trend === 'down' ? COLORS.error + '20' : COLORS.surface + '40',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: marketData.trend === 'up' ? COLORS.success :
                             marketData.trend === 'down' ? COLORS.error : COLORS.textSecondary,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: COLORS.surface,
        titleColor: COLORS.text,
        bodyColor: COLORS.text,
        borderColor: COLORS.surface,
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `Price: ${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: COLORS.surface,
        },
        ticks: {
          color: COLORS.textSecondary,
          font: {
            size: 10
          }
        }
      },
      y: {
        display: true,
        grid: {
          color: COLORS.surface,
        },
        ticks: {
          color: COLORS.textSecondary,
          font: {
            size: 10
          },
          callback: (value: any) => formatCurrency(value)
        }
      }
    },
    elements: {
      point: {
        hoverBorderWidth: 2
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Price Display */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(marketData.currentPrice)}
          </div>
          <div className={`flex items-center text-sm ${
            marketData.trend === 'up' ? 'text-green-400' :
            marketData.trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            <span className="mr-1">
              {marketData.trend === 'up' ? '📈' :
               marketData.trend === 'down' ? '📉' : '➡️'}
            </span>
            <span>
              {marketData.changePercent > 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-400">Volume</div>
          <div className="text-lg font-semibold text-white">
            {marketData.volume.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">High</div>
          <div className="text-lg font-semibold text-green-400">
            {formatCurrency(Math.max(...priceHistory))}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Low</div>
          <div className="text-lg font-semibold text-red-400">
            {formatCurrency(Math.min(...priceHistory))}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Avg</div>
          <div className="text-lg font-semibold text-blue-400">
            {formatCurrency(priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length)}
          </div>
        </div>
      </div>

      {/* Market Indicators */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              marketData.trend === 'up' ? 'bg-green-400' :
              marketData.trend === 'down' ? 'bg-red-400' : 'bg-gray-400'
            }`}></div>
            <span className="text-gray-400">
              {marketData.trend === 'up' ? 'Bullish' :
               marketData.trend === 'down' ? 'Bearish' : 'Neutral'}
            </span>
          </div>

          <div className="text-gray-400">
            Last update: {new Date(marketData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
