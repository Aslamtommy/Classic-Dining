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
import { ChevronDown, ChevronUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

interface RestaurantPerformance {
  restaurantId: string;
  name: string;
  totalRevenue: number;
  totalReservations: number;
  avgRevenuePerReservation: number;
  branches: Array<{ branchId: string; name: string; totalReservations: number; totalRevenue: number }>;
  revenueTrends: Array<{ date: string; revenue: number }> | undefined;
}

interface DashboardData {
  overview: { totalRevenue: number; totalReservations: number; activeRestaurants: number; activeBranches: number; userCount: number };
  reservationStats: { pending: number; confirmed: number; completed: number; cancelled: number };
  reservationTrends: Array<{ date: string; count: number; revenue: number }>;
  topRestaurants: Array<{ _id: string; name: string; revenue: number; reservations: number }>;
  branchActivity: Array<{ _id: string; name: string; reservations: number }>;
  pendingApprovals: number;
  topCustomers: Array<{ _id: string; name: string; email: string; totalBookings: number; totalSpent: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  systemHealth: { pendingIssues: number; couponUsage: Array<{ code: string; timesUsed: number; totalDiscount: number }> };
  restaurantPerformance: RestaurantPerformance[];
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"daily" | "monthly" | "yearly" | "custom">("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [expandedRestaurants, setExpandedRestaurants] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (filter !== "custom") fetchData();
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
      console.log("Dashboard Response:", response.data.data); // Log full response
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
    if (startDate && endDate) fetchData();
    else alert("Please select both start and end dates.");
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

  const toggleRestaurant = (restaurantId: string) => {
    setExpandedRestaurants((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(restaurantId)) newSet.delete(restaurantId);
      else newSet.add(restaurantId);
      return newSet;
    });
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div></div>;
  if (!data) return <div className="flex items-center justify-center h-screen text-red-500 text-lg">No data available</div>;

  // Chart Data
  const reservationStatsData = {
    labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
    datasets: [{ data: [data.reservationStats.pending, data.reservationStats.confirmed, data.reservationStats.completed, data.reservationStats.cancelled], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#E7E9ED"] }],
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
    datasets: [{ label: "Revenue", data: data.topRestaurants.map((r) => r.revenue), backgroundColor: "#10B981" }],
  };

  const branchActivityData = {
    labels: data.branchActivity.map((b) => b.name),
    datasets: [{ label: "Reservations", data: data.branchActivity.map((b) => b.reservations), backgroundColor: "#FBBF24" }],
  };

  const userGrowthData = {
    labels: data.userGrowth.map((u) => u.date),
    datasets: [{ label: "New Users", data: data.userGrowth.map((u) => u.count), borderColor: "#4CAF50", fill: false }],
  };

  const restaurantTrends = (restaurant: RestaurantPerformance) => {
    const trends = Array.isArray(restaurant.revenueTrends) ? restaurant.revenueTrends : [];
    console.log(`Revenue Trends for ${restaurant.name}:`, trends); // Log trends
    return {
      labels: trends.length > 0 ? trends.map((t) => t.date || "Unknown Date") : ["No Data"],
      datasets: [{
        label: `${restaurant.name} Revenue`,
        data: trends.length > 0 ? trends.map((t) => t.revenue || 0) : [0],
        borderColor: "#10B981",
        fill: false,
      }],
    };
  };

  // Base Chart Options
  const baseLineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: true, font: { size: 16 } } },
    scales: { x: { ticks: { color: "#6b7280" } }, y: { ticks: { color: "#6b7280" }, beginAtZero: true } },
  };

  const basePieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: true, font: { size: 16 } } },
  };

  const baseBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: true, font: { size: 16 } } },
    scales: { x: { ticks: { color: "#6b7280" } }, y: { ticks: { color: "#6b7280" }, beginAtZero: true } },
  };

  const withTitle = <T extends "line" | "pie" | "bar">(
    options: ChartOptions<T>,
    title: string
  ): ChartOptions<T> => {
    return {
      ...options,
      plugins: {
        ...(options?.plugins || {}),
        title: {
          ...(options?.plugins?.title || {}),
          display: true,
          text: title,
        },
      },
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Logout</button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-start gap-4 mb-8">
          <div className="flex space-x-2">
            {["daily", "monthly", "yearly", "custom"].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-indigo-100 border border-gray-200"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {filter === "custom" && (
            <form onSubmit={handleCustomDateSubmit} className="flex flex-col sm:flex-row gap-4">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded-lg" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded-lg" />
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Apply</button>
            </form>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {Object.entries(data.overview).map(([key, value]) => (
            <div key={key} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-sm font-medium text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</h2>
              <p className="text-2xl font-bold text-gray-900 mt-2">{key === 'totalRevenue' ? `₹${value.toLocaleString()}` : value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96">
            <Line data={reservationTrendsData} options={withTitle<"line">(baseLineOptions, "Reservation Trends")} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96">
            <Pie data={reservationStatsData} options={withTitle<"pie">(basePieOptions, "Reservation Status")} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96">
            <Bar data={topRestaurantsData} options={withTitle<"bar">(baseBarOptions, "Top Restaurants by Revenue")} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96">
            <Bar data={branchActivityData} options={withTitle<"bar">(baseBarOptions, "Branch Activity")} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96">
            <Line data={userGrowthData} options={withTitle<"line">(baseLineOptions, "User Growth")} />
          </div>
        </div>

        {/* Restaurant Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">Restaurant Performance</h2>
          {data.restaurantPerformance.map((rest) => {
            console.log(`Restaurant ${rest.name} Data:`, rest); // Log full restaurant data
            return (
              <div key={rest.restaurantId} className="p-6 border-b border-gray-200 last:border-b-0">
                <button onClick={() => toggleRestaurant(rest.restaurantId)} className="w-full flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">{rest.name}</h3>
                  {expandedRestaurants.has(rest.restaurantId) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedRestaurants.has(rest.restaurantId) && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-gray-50 rounded-lg"><span className="font-medium">Total Revenue:</span> ₹{rest.totalRevenue.toLocaleString()}</div>
                      <div className="p-4 bg-gray-50 rounded-lg"><span className="font-medium">Reservations:</span> {rest.totalReservations}</div>
                      <div className="p-4 bg-gray-50 rounded-lg"><span className="font-medium">Avg Revenue/Reservation:</span> ₹{rest.avgRevenuePerReservation.toFixed(2)}</div>
                    </div>
                    <div className="h-64 mb-4">
                      <Line data={restaurantTrends(rest)} options={withTitle<"line">(baseLineOptions, `${rest.name} Revenue Trends`)} />
                    </div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Branches</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservations</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {rest.branches.length > 0 ? (
                            rest.branches.map((branch) => (
                              <tr key={branch.branchId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {branch.name || "Unnamed Branch"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {branch.totalReservations || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{(branch.totalRevenue || 0).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">No branches available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h2>
            <ul className="space-y-2">{data.topCustomers.map((c) => <li key={c._id} className="text-gray-700">{c.name} ({c.email}) - {c.totalBookings} bookings, ₹{c.totalSpent.toLocaleString()}</li>)}</ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <p className="text-gray-700">Pending Issues: {data.systemHealth.pendingIssues}</p>
            <h3 className="text-md font-medium text-gray-800 mt-4">Coupon Usage</h3>
            <ul className="space-y-2">{data.systemHealth.couponUsage.map((c) => <li key={c.code} className="text-gray-700">{c.code} - Used: {c.timesUsed}, Discount: ₹{c.totalDiscount.toLocaleString()}</li>)}</ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
            <p className="text-gray-700">{data.pendingApprovals} restaurant(s) awaiting approval</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;