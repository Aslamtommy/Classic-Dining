// src/components/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import adminApi from "../../Axios/adminInstance";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface DashboardData {
  overview: { totalRevenue: number; totalReservations: number; activeRestaurants: number; activeBranches: number; userCount: number };
  reservationStats: { pending: number; confirmed: number; completed: number; cancelled: number };
  reservationTrends: Array<{ date: string; count: number; revenue: number }>;
  topRestaurants: Array<{ _id: string; name: string; revenue: number; reservations: number }>;
  branchActivity: Array<{ _id: string; name: string; reservations: number }>;
  pendingApprovals: number;
  topCustomers: Array<{ _id: string; name: string; email: string; totalBookings: number; totalSpent: number }>;
  userGrowth: Array<{ date: string; count: number }>;
 
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"daily" | "monthly" | "yearly" | "custom">("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (filter !== "custom") {
      fetchData();
    }
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (filter !== "custom") {
        params.filter = filter;
      }
      const response: any = await adminApi.get("/dashboard", { params });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: "daily" | "monthly" | "yearly" | "custom") => {
    setFilter(newFilter);
    if (newFilter !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      fetchData();
    } else {
      alert("Please select both start and end dates.");
    }
  };

  const handleLogout = async () => {
    try {
       
      await adminApi.post('/logout');
    
      
   
      window.location.href = '/admin/login'; 
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 text-lg">Loading...</div>;
  if (!data) return <div className="flex items-center justify-center h-screen text-red-500 text-lg">No data available</div>;

  // Chart Data (unchanged)
  const reservationStatsData = {
    labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          data.reservationStats.pending,
          data.reservationStats.confirmed,
          data.reservationStats.completed,
          data.reservationStats.cancelled,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#E7E9ED"],
      },
    ],
  };

  const reservationTrendsData = {
    labels: data.reservationTrends.map((t) => t.date),
    datasets: [
      { label: "Reservations", data: data.reservationTrends.map((t) => t.count), borderColor: "#36A2EB", fill: false },
      { label: "Revenue", data: data.reservationTrends.map((t) => t.revenue), borderColor: "#FF6384", fill: false },
    ],
  };

  const topRestaurantsData = {
    labels: data.topRestaurants.map((r) => r.name),
    datasets: [{ label: "Revenue", data: data.topRestaurants.map((r) => r.revenue), backgroundColor: "#36A2EB" }],
  };

  const branchActivityData = {
    labels: data.branchActivity.map((b) => b.name),
    datasets: [{ label: "Reservations", data: data.branchActivity.map((b) => b.reservations), backgroundColor: "#FFCE56" }],
  };

  const userGrowthData = {
    labels: data.userGrowth.map((u) => u.date),
    datasets: [{ label: "New Users", data: data.userGrowth.map((u) => u.count), borderColor: "#4CAF50", fill: false }],
  };

  // Chart Options (unchanged)
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${filter === "custom" ? "Custom" : filter.charAt(0).toUpperCase() + filter.slice(1)} Trends`, font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Value" } },
    },
  };

  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Reservation Status", font: { size: 16 } },
    },
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Top Restaurants by Revenue", font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: "Restaurant" } },
      y: { title: { display: true, text: "Revenue (₹)" } },
    },
  };

  const branchBarChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Branch Activity", font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: "Branch" } },
      y: { title: { display: true, text: "Reservations" } },
    },
  };

  const userGrowthChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${filter === "custom" ? "Custom" : filter.charAt(0).toUpperCase() + filter.slice(1)} User Growth`, font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "New Users" } },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-start gap-4 mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange("daily")}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${filter === "daily" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100 border border-gray-300"}`}
          >
            Daily
          </button>
          <button
            onClick={() => handleFilterChange("monthly")}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${filter === "monthly" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100 border border-gray-300"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleFilterChange("yearly")}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${filter === "yearly" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100 border border-gray-300"}`}
          >
            Yearly
          </button>
          <button
            onClick={() => handleFilterChange("custom")}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${filter === "custom" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100 border border-gray-300"}`}
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
              className="bg-white text-gray-700 rounded-lg p-3 border-none shadow-sm focus:ring-2 focus:ring-indigo-600 w-full max-w-xs"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white text-gray-700 rounded-lg p-3 border-none shadow-sm focus:ring-2 focus:ring-indigo-600 w-full max-w-xs"
              placeholder="End Date"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-sm font-medium text-gray-600">Total Revenue</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-2">₹{data.overview.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-sm font-medium text-gray-600">Total Reservations</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{data.overview.totalReservations.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-sm font-medium text-gray-600">Active Restaurants</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{data.overview.activeRestaurants.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-sm font-medium text-gray-600">Active Branches</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{data.overview.activeBranches.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-sm font-medium text-gray-600">User Count</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{data.overview.userCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
          <Line data={reservationTrendsData} options={lineChartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
          <Pie data={reservationStatsData} options={pieChartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
          <Bar data={topRestaurantsData} options={barChartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
          <Bar data={branchActivityData} options={branchBarChartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
          <Line data={userGrowthData} options={userGrowthChartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Approvals</h2>
          <p className="text-gray-700">{data.pendingApprovals} restaurant(s) awaiting approval</p>
        </div>
      </div>

      {/* Additional Info (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Customers</h2>
          <ul className="space-y-3">
            {data.topCustomers.length > 0 ? (
              data.topCustomers.map((customer) => (
                <li key={customer._id} className="text-gray-700">
                  <span className="font-medium">{customer.name}</span> ({customer.email}) - {customer.totalBookings} bookings, ₹{customer.totalSpent.toLocaleString()}
                </li>
              ))
            ) : (
              <li className="text-gray-700">No top customers available.</li>
            )}
          </ul>
        </div>
       
      </div>
    </div>
  );
};

export default AdminDashboard;