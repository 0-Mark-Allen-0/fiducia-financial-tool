import { useMemo } from 'react';
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
import { useFinancialData } from '../../../context/FinancialContext';
import { formatCurrency } from '../../../utils/format';

// Register Chart.js components
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

export function WealthChart() {
  const { dashboardData, isProMode } = useFinancialData();
  
  // FIX: Access 'netWorthSeries' instead of 'series'
  // We also default to an empty array [] to prevent the "undefined" error during initial load
  const series = dashboardData.netWorthSeries || [];

  const chartData = useMemo(() => {
    // Safety check: If no data, return empty structure to avoid crash
    if (!series.length) {
        return { labels: [], datasets: [] };
    }

    return {
      labels: series.map(d => `Year ${d.year}`),
      datasets: [
        {
          label: 'Net Worth (Nominal)',
          // FIX: Updated property names to match new Context structure
          data: series.map(d => d.netWorthNominal),
          borderColor: '#007aff',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
        {
          label: 'Net Worth (Inflation Adj)',
          // FIX: Updated property names to match new Context structure
          data: series.map(d => d.netWorthReal),
          borderColor: '#34c759',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [series]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: isProMode ? '#94a3b8' : '#475569',
            font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        padding: 12,
        callbacks: {
            label: (context) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
                return label;
            }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isProMode ? '#64748b' : '#94a3b8', maxTicksLimit: 8 }
      },
      y: {
        grid: { color: isProMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: {
            color: isProMode ? '#64748b' : '#94a3b8',
            callback: (value) => {
                if(value >= 10000000) return (value/10000000).toFixed(1) + 'Cr';
                if(value >= 100000) return (value/100000).toFixed(0) + 'L';
                return value;
            }
        }
      }
    }
  };

  return (
    <div className="glass-card p-6 mb-8 h-[400px]">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span>📈</span> The Power of Compounding
        </h3>
        <div className="h-[320px] w-full">
            <Line data={chartData} options={options} />
        </div>
    </div>
  );
}