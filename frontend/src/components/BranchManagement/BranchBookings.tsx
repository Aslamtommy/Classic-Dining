import React, { useEffect, useState } from "react";
import restaurentApi from "../../Axios/restaurentInstance";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Users, Utensils, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const BranchBookings: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const statusStyles: { [key: string]: string } = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-rose-100 text-rose-800",
  };

  const fetchBookings = async () => {
    if (!branchId) {
      toast.error("Branch ID is missing");
      return;
    }
    setLoading(true);
    try {
      const response: any = await restaurentApi.get(`/branches/${branchId}/reservations`, {
        params: { page, limit, status: statusFilter },
      });
      setBookings(response.data.data.reservations || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [branchId, page, statusFilter]);

  const handleStatusUpdate = async (reservationId: string, status: string) => {
    try {
      await restaurentApi.put(`/reservations/${reservationId}/status`, { status });
      toast.success(`Reservation ${status}`);
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-2">
            Reservation Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage current and upcoming bookings with real-time status updates and detailed guest information
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <select
            onChange={(e) => {
              setStatusFilter(e.target.value === "all" ? undefined : e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Reservations</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reservations found matching your criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Guest Info */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {booking.userId?.name || "Unknown User"}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      {new Date(booking.reservationDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {booking.timeSlot}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {booking.partySize} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-gray-400" />
                      {booking.tableType.name} (Capacity: {booking.tableType.capacity})
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Special Requests:</span>{" "}
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-2">
                    {["pending", "confirmed"].includes(booking.status) && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                          className="flex-1 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                            className="flex-1 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "completed")}
                            className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchBookings;