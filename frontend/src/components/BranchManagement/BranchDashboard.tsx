"use client"

import { useEffect, useState } from "react"
import restaurentApi from "../../Axios/restaurentInstance"
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
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"
import { motion } from "framer-motion"
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

interface DashboardData {
  reservationStats: { totalPending: number; totalConfirmed: number; totalCompleted: number; totalCancelled: number }
  revenueStats: { totalRevenueFromCompleted: number; totalPendingRevenue: number; totalRefundsIssued: number }
  reservationTrends: Array<{ date: string; count: number; revenue: number }>
  tableUtilization: Array<{ tableType: string; totalBookings: number }>
  topCustomers: Array<{ userId: string; name: string; totalBookings: number; totalSpent: number }>
}

const BranchDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [filter, setFilter] = useState<"daily" | "monthly" | "yearly" | "custom">("daily")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Only fetch data when filter changes (for "daily", "monthly", "yearly")
    if (filter !== "custom") {
      fetchDashboardData()
    }
  }, [filter])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filter === "custom" && startDate && endDate) {
        params.startDate = startDate
        params.endDate = endDate
      } else if (filter !== "custom") {
        params.filter = filter
      }
      const response: any = await restaurentApi.get("/dashboard", { params })
      setData(response.data.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: "daily" | "monthly" | "yearly" | "custom") => {
    setFilter(newFilter)
    if (newFilter !== "custom") {
      setStartDate("")
      setEndDate("")
    }
  }

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Prevent page refresh
    if (startDate && endDate) {
      fetchDashboardData()
    } else {
      alert("Please select both start and end dates.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl text-amber-700 font-serif">Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <h2 className="text-2xl text-red-600 font-serif p-8 bg-red-50 rounded-lg shadow-md">
          Unable to Load Dashboard Data
        </h2>
      </div>
    )
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const, 
        labels: { 
          font: { size: 14, family: "Playfair Display, serif" }, 
          color: "#4a4a4a" 
        } 
      },
      tooltip: { 
        backgroundColor: "#4a4a4a", 
        titleFont: { size: 14, family: "Playfair Display, serif" }, 
        bodyFont: { size: 12, family: "Playfair Display, serif" } 
      },
    },
    scales: { 
      x: { ticks: { color: "#6b7280" } }, 
      y: { ticks: { color: "#6b7280" } } 
    },
  }

  const reservationTrendData = {
    labels: data.reservationTrends.map((t) => t.date),
    datasets: [
      { 
        label: "Reservations", 
        data: data.reservationTrends.map((t) => t.count), 
        borderColor: "#b45309", 
        backgroundColor: "rgba(180, 83, 9, 0.2)", 
        fill: true, 
        tension: 0.4 
      },
      { 
        label: "Revenue (₹)", 
        data: data.reservationTrends.map((t) => t.revenue), 
        borderColor: "#065f46", 
        backgroundColor: "rgba(6, 95, 70, 0.2)", 
        fill: true, 
        tension: 0.4 
      },
    ],
  }

  const tableUtilizationData = {
    labels: data.tableUtilization.map((t) => t.tableType),
    datasets: [{ 
      label: "Bookings", 
      data: data.tableUtilization.map((t) => t.totalBookings), 
      backgroundColor: "#b45309", 
      borderColor: "#92400e", 
      borderWidth: 1 
    }],
  }

  const reservationStatsData = {
    labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
    datasets: [{ 
      data: [
        data.reservationStats.totalPending, 
        data.reservationStats.totalConfirmed, 
        data.reservationStats.totalCompleted, 
        data.reservationStats.totalCancelled
      ], 
      backgroundColor: ["#fbbf24", "#0891b2", "#059669", "#ef4444"], 
      borderWidth: 0 
    }],
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 rounded-xl shadow-elegant">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-playfair text-center mb-6">
            Branch Insights Dashboard
          </h1>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-8"></div>
        </motion.div>

        {/* Filter Buttons and Date Pickers */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange("daily")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "daily" 
                  ? "bg-amber-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => handleFilterChange("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "monthly" 
                  ? "bg-amber-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleFilterChange("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "yearly" 
                  ? "bg-amber-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => handleFilterChange("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "custom" 
                  ? "bg-amber-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-amber-100 border border-amber-200"
              }`}
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
                className="bg-white text-gray-700 rounded-lg p-3 border border-amber-200 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full max-w-xs"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white text-gray-700 rounded-lg p-3 border border-amber-200 shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full max-w-xs"
                placeholder="End Date"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100"
          >
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                Reservation Trends
              </h2>
              <div className="h-72 md:h-80">
                <Line data={reservationTrendData} options={chartOptions} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100"
          >
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Users className="w-5 h-5 mr-2 text-amber-600" />
                Table Utilization
              </h2>
              <div className="h-72 md:h-80">
                <Bar data={tableUtilizationData} options={chartOptions} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100"
          >
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-amber-600" />
                Reservation Status
              </h2>
              <div className="h-64 md:h-72">
                <Pie data={reservationStatsData} options={chartOptions} />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100"
          >
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-amber-600" />
                Revenue Overview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-gray-700">Total Revenue:</p>
                  <p className="text-amber-700 font-semibold">₹{data.revenueStats.totalRevenueFromCompleted.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">Pending Revenue:</p>
                  <p className="text-blue-700 font-semibold">₹{data.revenueStats.totalPendingRevenue.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <p className="text-gray-700">Refunds Issued:</p>
                  <p className="text-red-700 font-semibold">₹{data.revenueStats.totalRefundsIssued.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100"
          >
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-amber-600" />
                Top Customers
              </h2>
              {data.topCustomers.length > 0 ? (
                <div className="space-y-3">
                  {data.topCustomers.map((customer) => (
                    <div key={customer.userId} className="p-3 border-b border-amber-100 last:border-0">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">{customer.totalBookings} bookings</span>
                        <span className="text-amber-700">₹{customer.totalSpent.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No top customers data available yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default BranchDashboard
