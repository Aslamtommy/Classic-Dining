import React, { useEffect, useState } from 'react';
import restaurentApi from '../../../Axios/restaurentInstance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Reservation {
  _id: string;
  branchName: string;
  reservationDate: string;
  timeSlot: string;
  status: string;
  amount: number;
}

interface BranchReservations {
  branchId: string;
  branchName: string;
  reservations: Reservation[];
}

interface MainDashboardData {
  totalBranches: number;
  totalReservations: number;
  totalRevenue: number;
  reservationTrends: Array<{ date: string; count: number }>;
  branchReservations: BranchReservations[];
}

const MainRestaurantDashboard: React.FC = () => {
  const [data, setData] = useState<MainDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'7days' | '30days' | 'month' | 'year'>('30days');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response: any = await restaurentApi.get('/main-dashboard', {
          params: { filter },
        });
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [filter]);

  const toggleBranch = (branchId: string) => {
    setExpandedBranches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) newSet.delete(branchId);
      else newSet.add(branchId);
      return newSet;
    });
  };

  const handleFilterChange = (newFilter: '7days' | '30days' | 'month' | 'year') => {
    setFilter(newFilter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-2xl text-red-600 font-semibold">{error || 'No data available'}</div>
      </div>
    );
  }

  // Chart Data
  const chartData = {
    labels: data.reservationTrends.map((trend) => trend.date),
    datasets: [
      {
        label: 'Reservations',
        data: data.reservationTrends.map((trend) => trend.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 14 }, color: '#1f2937' } },
      tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } },
    },
    scales: {
      x: { ticks: { color: '#6b7280' } },
      y: { ticks: { color: '#6b7280' }, beginAtZero: true },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Admin Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('7days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === '7days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleFilterChange('30days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === '30days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleFilterChange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => handleFilterChange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
              }`}
            >
              Last Year
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <h2 className="text-lg font-medium text-gray-600">Total Branches</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalBranches}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <h2 className="text-lg font-medium text-gray-600">Total Reservations</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalReservations}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <h2 className="text-lg font-medium text-gray-600">Total Revenue</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{data.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Reservation Trends Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reservation Trends ({filter === '7days' ? 'Last 7 Days' : filter === '30days' ? 'Last 30 Days' : filter === 'month' ? 'Last Month' : 'Last Year'})
          </h2>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Branch Reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">Recent Reservations by Branch</h2>
          {data.branchReservations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {data.branchReservations.map((branch) => (
                <div key={branch.branchId} className="p-6">
                  <button
                    onClick={() => toggleBranch(branch.branchId)}
                    className="w-full flex justify-between items-center text-left focus:outline-none"
                  >
                    <h3 className="text-lg font-medium text-gray-800">{branch.branchName}</h3>
                    {expandedBranches.has(branch.branchId) ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  {expandedBranches.has(branch.branchId) && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {branch.reservations.map((reservation) => (
                            <tr key={reservation._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(reservation.reservationDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.timeSlot}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.status}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{reservation.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-gray-600">No recent reservations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainRestaurantDashboard;