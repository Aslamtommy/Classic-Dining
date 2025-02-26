import React, { useEffect, useState } from "react";
import restaurentApi from "../../Axios/restaurentInstance";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const BranchBookings: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!branchId) {
        toast.error("Branch ID is missing", { style: { background: '#e63946', color: '#fff' } });
        return;
      }
      setLoading(true);
      try {
        const response: any = await restaurentApi.get(`/branches/${branchId}/reservations`);
        setBookings(response.data.data || []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch bookings", {
          style: { background: '#e63946', color: '#fff' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [branchId]);

  const handleUpdateStatus = async (reservationId: string, status: string) => {
    try {
      const endpoint =
        status === "confirmed" ? `/reservations/${reservationId}/confirm` : `/reservations/${reservationId}/cancel`;
      const response = await restaurentApi.put(endpoint, {});
      setBookings((prev) =>
        prev.map((b) => (b._id === reservationId ? { ...b, status } : b))
      );
      toast.success(`Booking ${status} successfully!`, {
        style: { background: '#2a9d8f', color: '#fff' },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update booking to ${status}`, {
        style: { background: '#e63946', color: '#fff' },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f4ede8] to-[#e8e2d9] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[#5a3e36] text-2xl font-playfair font-semibold tracking-tight"
        >
          Loading Your Reservations...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4ede8] to-[#e8e2d9] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-[#2c2420] tracking-tight">
            Branch Reservations
          </h2>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="w-16 h-[2px] bg-[#d4a373]"></div>
            <p className="text-sm text-[#2c2420]/70 font-medium uppercase tracking-wider">
              Elegant Dining Awaits
            </p>
            <div className="w-16 h-[2px] bg-[#d4a373]"></div>
          </div>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center text-[#8b5d3b] text-lg font-playfair italic"
          >
            No reservations yet. Awaiting your esteemed guests.
          </motion.p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-[#e8e2d9]/50 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-[#2c2420] font-playfair font-semibold text-lg">
                      <span className="text-[#8b5d3b]">Guest:</span> {booking.user.name}
                    </p>
                    <p className="text-[#8b5d3b] text-sm">
                      <span className="font-medium">Email:</span> {booking.user.email}
                    </p>
                    <p className="text-[#8b5d3b] text-sm">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(booking.reservationDate).toLocaleString()}
                    </p>
                    <p className="text-[#8b5d3b] text-sm">
                      <span className="font-medium">Time:</span> {booking.timeSlot}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[#8b5d3b] text-sm">
                      <span className="font-medium">Guests:</span> {booking.partySize}
                    </p>
                    <p className="text-[#8b5d3b] text-sm">
                      <span className="font-medium">Table:</span> {booking.tableType.name} (Capacity:{" "}
                      {booking.tableType.capacity})
                    </p>
                    <p className="text-[#8b5d3b] text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`${
                          booking.status === "confirmed"
                            ? "text-green-600"
                            : booking.status === "cancelled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        } font-semibold`}
                      >
                        {booking.status}
                      </span>
                    </p>
                    <p className="text-[#8b5d3b] text-sm italic">
                      <span className="font-medium">Requests:</span>{" "}
                      {booking.specialRequests || "None"}
                    </p>
                  </div>
                </div>
                {booking.status === "pending" && (
                  <div className="mt-4 flex gap-3">
                    <motion.button
                      onClick={() => handleUpdateStatus(booking._id, "confirmed")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 bg-gradient-to-r from-[#2a9d8f] to-[#48bca9] text-white rounded-full font-medium shadow-md hover:from-[#48bca9] hover:to-[#2a9d8f] transition-all duration-300"
                    >
                      Confirm
                    </motion.button>
                    <motion.button
                      onClick={() => handleUpdateStatus(booking._id, "cancelled")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 bg-gradient-to-r from-[#e63946] to-[#f17c85] text-white rounded-full font-medium shadow-md hover:from-[#f17c85] hover:to-[#e63946] transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchBookings;