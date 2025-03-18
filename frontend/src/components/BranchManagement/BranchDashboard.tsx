// src/components/BranchDashboard.tsx
import React, { useEffect, useState } from 'react';
import restaurentApi from '../../Axios/restaurentInstance';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

interface DashboardData {
  reservationStats: { totalPending: number; totalConfirmed: number; totalCompleted: number; totalCancelled: number };
  revenueStats: { totalRevenueFromCompleted: number; totalPendingRevenue: number; totalRefundsIssued: number };
  reservationTrends: Array<{ date: string; count: number; revenue: number }>;
  tableUtilization: Array<{ tableType: string; totalBookings: number }>;
  topCustomers: Array<{ userId: string; name: string; totalBookings: number; totalSpent: number }>;
  couponUsage: Array<{ code: string; timesUsed: number; totalDiscount: number }>;
}

const BranchDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filter, setFilter] = useState<"daily" | "monthly" | "yearly" | "custom">("daily");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only fetch data when filter changes (for "daily", "monthly", "yearly")
    if (filter !== "custom") {
      fetchDashboardData();
    }
  }, [filter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (filter !== "custom") {
        params.filter = filter;
      }
      const response: any = await restaurentApi.get('/dashboard', { params });
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "daily" | "monthly" | "yearly" | "custom") => {
    setFilter(newFilter);
    if (newFilter !== "custom") {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    if (startDate && endDate) {
      fetchDashboardData();
    } else {
      alert("Please select both start and end dates.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-2xl text-gray-500 animate-fade-in">Loading Dashboard...</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-2xl text-red-500">Unable to Load Dashboard Data</h2>
      </div>
    );
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 14, family: 'Roboto' }, color: '#34495e' } },
      tooltip: { backgroundColor: '#34495e', titleFont: { size: 14, family: 'Roboto' }, bodyFont: { size: 12, family: 'Roboto' } },
    },
    scales: { x: { ticks: { color: '#7f8c8d' } }, y: { ticks: { color: '#7f8c8d' } } },
  };

  const reservationTrendData = {
    labels: data.reservationTrends.map((t) => t.date),
    datasets: [
      { label: 'Reservations', data: data.reservationTrends.map((t) => t.count), borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.2)', fill: true, tension: 0.4 },
      { label: 'Revenue (₹)', data: data.reservationTrends.map((t) => t.revenue), borderColor: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.2)', fill: true, tension: 0.4 },
    ],
  };

  const tableUtilizationData = {
    labels: data.tableUtilization.map((t) => t.tableType),
    datasets: [{ label: 'Bookings', data: data.tableUtilization.map((t) => t.totalBookings), backgroundColor: '#e67e22', borderColor: '#d35400', borderWidth: 1 }],
  };

  const reservationStatsData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [{ data: [data.reservationStats.totalPending, data.reservationStats.totalConfirmed, data.reservationStats.totalCompleted, data.reservationStats.totalCancelled], backgroundColor: ['#f1c40f', '#3498db', '#2ecc71', '#e74c3c'], borderWidth: 0 }],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif text-center mb-6">Branch Insights Dashboard</h1>
        <hr className="border-gray-300 mb-8" />

        {/* Filter Buttons and Date Pickers */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange("daily")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "daily" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-300"}`}
            >
              Daily
            </button>
            <button
              onClick={() => handleFilterChange("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "monthly" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-300"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleFilterChange("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "yearly" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-300"}`}
            >
              Yearly
            </button>
            <button
              onClick={() => handleFilterChange("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "custom" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-300"}`}
            >
              Custom
            </button>
          </div>
          {filter === "custom" && (
            <form onSubmit={handleCustomDateSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white text-gray-700 rounded-lg p-3 border-none shadow-sm focus:ring-2 focus:ring-gray-800 w-full max-w-xs"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white text-gray-700 rounded-lg p-3 border-none shadow-sm focus:ring-2 focus:ring-gray-800 w-full max-w-xs"
                placeholder="End Date"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Reservation Trends</h2>
              <div className="h-72 md:h-80">
                <Line data={reservationTrendData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Table Utilization</h2>
              <div className="h-72 md:h-80">
                <Bar data={tableUtilizationData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Reservation Status</h2>
              <div className="h-64 md:h-72">
                <Pie data={reservationStatsData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Revenue Overview</h2>
              <p className="text-gray-600">Total Revenue: ₹{data.revenueStats.totalRevenueFromCompleted.toLocaleString()}</p>
              <p className="text-gray-600">Pending Revenue: ₹{data.revenueStats.totalPendingRevenue.toLocaleString()}</p>
              <p className="text-gray-600">Refunds Issued: ₹{data.revenueStats.totalRefundsIssued.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Top Customers</h2>
              {data.topCustomers.length > 0 ? (
                data.topCustomers.map((customer) => (
                  <p key={customer.userId} className="text-gray-600">
                    {customer.name}: {customer.totalBookings} bookings, ₹{customer.totalSpent.toLocaleString()}
                  </p>
                ))
              ) : (
                <p className="text-gray-600">No top customers yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 col-span-1 md:col-span-2 lg:col-span-3">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-700 mb-2">Coupon Usage</h2>
              {data.couponUsage.length > 0 ? (
                data.couponUsage.map((coupon) => (
                  <p key={coupon.code} className="text-gray-600">
                    {coupon.code}: Used {coupon.timesUsed} times, ₹{coupon.totalDiscount.toLocaleString()} discount
                  </p>
                ))
              ) : (
                <p className="text-gray-600">No coupons used yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;