"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import restaurentApi from "../../../Axios/restaurentInstance"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js"
import { Line } from "react-chartjs-2"
import { ChevronDown, ChevronUp, Calendar, Users, DollarSign, TrendingUp } from "lucide-react"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface Reservation {
  _id: string
  branchName: string
  reservationDate: string
  timeSlot: string
  status: string
  amount: number
}

interface BranchReservations {
  branchId: string
  branchName: string
  reservations: Reservation[]
}

interface MainDashboardData {
  totalBranches: number
  totalReservations: number
  totalRevenue: number
  reservationTrends: Array<{ date: string; count: number }>
  branchReservations: BranchReservations[]
}

const MainRestaurantDashboard = () => {
  const [data, setData] = useState<MainDashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<"7days" | "30days" | "month" | "year">("30days")

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const response: any = await restaurentApi.get("/main-dashboard", {
          params: { filter },
        })
        setData(response.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [filter])

  const toggleBranch = (branchId: string) => {
    setExpandedBranches((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(branchId)) newSet.delete(branchId)
      else newSet.add(branchId)
      return newSet
    })
  }

  const handleFilterChange = (newFilter: "7days" | "30days" | "month" | "year") => {
    setFilter(newFilter)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-2xl text-red-600 font-semibold">{error || "No data available"}</div>
      </div>
    )
  }

  // Chart Data
  const chartData = {
    labels: data.reservationTrends.map((trend) => trend.date),
    datasets: [
      {
        label: "Reservations",
        data: data.reservationTrends.map((trend) => trend.count),
        borderColor: "#B38A3A",
        backgroundColor: "rgba(179, 138, 58, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const, labels: { font: { size: 14 }, color: "#1f2937" } },
      tooltip: { backgroundColor: "#1f2937", titleFont: { size: 14 }, bodyFont: { size: 12 } },
    },
    scales: {
      x: { ticks: { color: "#6b7280" } },
      y: { ticks: { color: "#6b7280" }, beginAtZero: true },
    },
  }

  return (
    <motion.div
      className="min-h-screen bg-white p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-black"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Restaurant Admin Dashboard
          </motion.h1>
          <motion.div
            className="flex space-x-2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => handleFilterChange("7days")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "7days"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-black hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleFilterChange("30days")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "30days"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-black hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleFilterChange("month")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "month"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-black hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => handleFilterChange("year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "year"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-black hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Last Year
            </button>
          </motion.div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-start">
              <div className="mr-4 bg-amber-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-600">Total Branches</h2>
                <p className="text-3xl font-bold text-black mt-2">{data.totalBranches}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start">
              <div className="mr-4 bg-amber-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-600">Total Reservations</h2>
                <p className="text-3xl font-bold text-black mt-2">{data.totalReservations}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-start">
              <div className="mr-4 bg-amber-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-600">Total Revenue</h2>
                <p className="text-3xl font-bold text-black mt-2">₹{data.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reservation Trends Graph */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-amber-700 mr-2" />
            <h2 className="text-xl font-semibold text-black">
              Reservation Trends (
              {filter === "7days"
                ? "Last 7 Days"
                : filter === "30days"
                  ? "Last 30 Days"
                  : filter === "month"
                    ? "Last Month"
                    : "Last Year"}
              )
            </h2>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Branch Reservations */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-black p-6 border-b border-gray-200 flex items-center">
            <Calendar className="h-5 w-5 text-amber-700 mr-2" />
            Recent Reservations by Branch
          </h2>
          {data.branchReservations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {data.branchReservations.map((branch) => (
                <div key={branch.branchId} className="p-6">
                  <button
                    onClick={() => toggleBranch(branch.branchId)}
                    className="w-full flex justify-between items-center text-left focus:outline-none"
                  >
                    <h3 className="text-lg font-medium text-black">{branch.branchName}</h3>
                    {expandedBranches.has(branch.branchId) ? (
                      <ChevronUp className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-amber-600" />
                    )}
                  </button>
                  {expandedBranches.has(branch.branchId) && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {branch.reservations.map((reservation) => (
                            <tr key={reservation._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                {new Date(reservation.reservationDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{reservation.timeSlot}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    reservation.status === "confirmed"
                                      ? "bg-green-100 text-green-800"
                                      : reservation.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : reservation.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                ₹{reservation.amount.toLocaleString()}
                              </td>
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
        </motion.div>
      </div>
    </motion.div>
  )
}

export default MainRestaurantDashboard
