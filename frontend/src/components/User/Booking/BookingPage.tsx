"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import type { Branch } from "../../../types/branch"
import type { TableType, Reservation, Coupon } from "../../../types/reservation"
import {
  fetchBranchDetails,
  fetchAvailableTables,
  createReservation,
  fetchAvailableCoupons,
} from "../../../Api/userApi"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import toast, { Toaster } from "react-hot-toast"
import CouponModal from "./CouponModal"
import FilterModal from "./FilterModal"
import TableSelection from "./TableSelection"
import {
  Calendar,
  Users,
  Clock,
  Tag,
  Check,
  Gift,
  Info,
  Star,
  Utensils,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  MessageSquare,
} from "lucide-react"

interface UserState {
  user: {
    name: string
    email: string
    mobile: string
  } | null
}

interface ExtendedBranch extends Branch {
  operatingHours?: {
    open: string // e.g., "17:00"
    close: string // e.g., "23:00"
  }
}

const BookingPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const [branch, setBranch] = useState<ExtendedBranch | null>(null)
  const [availableTables, setAvailableTables] = useState<TableType[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [partySize, setPartySize] = useState<number | string>(2)
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState<string>("")
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [preferences, setPreferences] = useState<string[]>([])
  const [specialRequests, setSpecialRequests] = useState<string>("")

  const user = useSelector((state: { user: UserState }) => state.user.user)

  useEffect(() => {
    const loadBranchAndCoupons = async () => {
      try {
        if (!branchId) throw new Error("No branch ID provided")
        setLoading(true)
        const [branchData, couponData] = await Promise.all([fetchBranchDetails(branchId), fetchAvailableCoupons()])
        setBranch(branchData)
        setAvailableCoupons(couponData || [])
        generateTimeSlots(branchData)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load data"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    loadBranchAndCoupons()
  }, [branchId])

  useEffect(() => {
    if (selectedDate && selectedTime && branchId && partySize !== "moreThan20") {
      fetchAvailability()
    }
  }, [selectedDate, selectedTime, branchId, partySize])

  const generateTimeSlots = (branchData: ExtendedBranch) => {
    const operatingHours = branchData.operatingHours || { open: "17:00", close: "23:00" }
    const [openHour, openMinute] = operatingHours.open.split(":").map(Number)
    const [closeHour, closeMinute] = operatingHours.close.split(":").map(Number)

    const slots: string[] = []
    const currentTime = new Date()
    currentTime.setHours(openHour, openMinute, 0, 0)

    const closeTime = new Date()
    closeTime.setHours(closeHour, closeMinute, 0, 0)

    while (currentTime <= closeTime) {
      const timeString = currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      slots.push(timeString)
      currentTime.setMinutes(currentTime.getMinutes() + 30)
    }
    setTimeSlots(slots)
    setSelectedTime("")
  }

  const fetchAvailability = async () => {
    try {
      const formattedDate = selectedDate!.toISOString().split("T")[0]
      const response = await fetchAvailableTables(branchId!, formattedDate, selectedTime)
      const tables = Array.isArray(response) ? response : []
      setAvailableTables(tables)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch available tables"
      setError(message)
      setAvailableTables([])
      toast.error(message)
    }
  }

  const filteredTables = (availableTables || [])
    .filter((table) => {
      const matchesPreferences = preferences.length === 0 || preferences.every((pref) => table.features?.includes(pref))
      return matchesPreferences
    })
    .sort((a, b) => (sortOrder === "asc" ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0)))

  const handleTimeSlotClick = (time: string) => setSelectedTime(time)

  const applyCoupon = (code: string) => {
    setCouponCode(code)
    setIsCouponModalOpen(false)
    toast.success(`Coupon "${code}" applied successfully`)
  }

  const cancelCoupon = () => {
    setCouponCode("")
    toast.success("Coupon removed")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTable || !selectedTime || !selectedDate || !branchId || !branch || !user) {
      toast.error("Please complete all required fields and log in")
      return
    }
    // Add a submitting state to prevent double submission
    if (loading) return // Assuming `loading` can be reused here
    setLoading(true)
    try {
      const tableQuantity = Math.ceil(Number(partySize) / selectedTable.capacity)
      const reservationData: Partial<Reservation> = {
        branch: { _id: branchId, name: branch.name },
        tableType: selectedTable,
        reservationDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        partySize: Number(partySize),
        tableQuantity,
        preferences,
        specialRequests,
        user: { name: user.name, email: user.email, phone: user.mobile },
        couponCode,
      }
      const response = await createReservation(reservationData)
      toast.success(response.message || "Reservation confirmed!")
      setTimeout(() => {
        navigate(`/confirmation/${response.data._id}`, {
          state: {
            reservation: {
              ...reservationData,
              reservationId: response.data._id,
              price: response.data.finalAmount || selectedTable.price * tableQuantity,
              discountApplied: response.data.discountApplied || 0,
              finalAmount: response.data.finalAmount || selectedTable.price * tableQuantity,
            },
          },
        })
        setLoading(false) // Reset after navigation
      }, 2000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create reservation"
      toast.error(message)
      setError(message)
      setSelectedTable(null)
      setLoading(false)
    }
  }

  const selectedCoupon = availableCoupons.find((coupon) => coupon.code === couponCode)
  const tableQuantity = selectedTable ? Math.ceil(Number(partySize) / selectedTable.capacity) : 1
  const originalPrice = selectedTable ? selectedTable.price * tableQuantity : 0
  const discount = selectedCoupon
    ? selectedCoupon.discountType === "percentage"
      ? Math.min(
          originalPrice * (selectedCoupon.discount / 100),
          selectedCoupon.maxDiscountAmount || Number.POSITIVE_INFINITY,
        )
      : selectedCoupon.discount
    : 0
  const finalPrice = Math.max(originalPrice - discount, 0)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sepia-900 font-playfair text-xl">Loading reservation details...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white font-sans antialiased">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-5xl font-playfair text-sepia-900 font-bold mb-3">
            {branch ? branch.name : "Branch Not Found"}
          </h1>
          <div className="h-1 w-24 bg-gold-600 mx-auto mb-4"></div>
          <p className="text-bronze-700 text-lg">Reserve Your Table</p>
        </motion.div>

        {/* Branch Image */}
        {branch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12 rounded-xl overflow-hidden shadow-premium border border-sepia-200"
          >
            <img
              src={branch.mainImage || "https://via.placeholder.com/1200x400"}
              alt={branch.name}
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x400")}
            />
          </motion.div>
        )}

        {/* Branch Info */}
        {branch && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12 grid md:grid-cols-3 gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-elegant border border-sepia-200 flex items-center"
            >
              <MapPin className="w-8 h-8 text-sepia-700 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-bronze-700 mb-1">Location</h3>
                <p className="text-sepia-900">{branch.address || "Address not available"}</p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-elegant border border-sepia-200 flex items-center"
            >
              <Phone className="w-8 h-8 text-sepia-700 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-bronze-700 mb-1">Contact</h3>
                <p className="text-sepia-900">{branch.phone || "Phone not available"}</p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-elegant border border-sepia-200 flex items-center"
            >
              <Mail className="w-8 h-8 text-sepia-700 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-bronze-700 mb-1">Email</h3>
                <p className="text-sepia-900">{branch.email || "Email not available"}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Booking Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-premium border border-sepia-200 p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
            >
              <div className="flex">
                <Info className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {/* Date & Party Size */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="flex items-center text-sepia-900 text-lg font-playfair font-medium mb-3">
                <Calendar className="w-5 h-5 mr-2 text-sepia-700" />
                Select Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()}
                className="w-full px-4 py-3 bg-sepia-50 border border-sepia-200 rounded-lg text-sepia-900 focus:outline-none focus:ring-2 focus:ring-sepia-600 focus:border-transparent transition-all duration-200"
                placeholderText="Select a date"
              />
            </div>
            <div>
              <label className="flex items-center text-sepia-900 text-lg font-playfair font-medium mb-3">
                <Users className="w-5 h-5 mr-2 text-sepia-700" />
                Party Size
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value === "moreThan20" ? "moreThan20" : Number(e.target.value))}
                className="w-full px-4 py-3 bg-sepia-50 border border-sepia-200 rounded-lg text-sepia-900 focus:outline-none focus:ring-2 focus:ring-sepia-600 focus:border-transparent transition-all duration-200"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? "Person" : "People"}
                  </option>
                ))}
                <option value="moreThan20">More than 20</option>
              </select>
            </div>
          </div>

          {partySize !== "moreThan20" ? (
            <>
              {/* Time Slots */}
              <div className="mb-10">
                <label className="flex items-center text-sepia-900 text-lg font-playfair font-medium mb-3">
                  <Clock className="w-5 h-5 mr-2 text-sepia-700" />
                  Select a Time
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((time) => (
                    <motion.button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSlotClick(time)}
                      className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? "bg-gradient-to-r from-sepia-700 to-sepia-900 text-white shadow-md"
                          : "bg-sepia-50 text-sepia-900 hover:bg-sepia-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="mb-10">
                <label className="flex items-center text-sepia-900 text-lg font-playfair font-medium mb-3">
                  <Star className="w-5 h-5 mr-2 text-sepia-700" />
                  Preferences (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {["windowView", "outdoor", "accessible", "quiet", "booth", "private"].map((pref) => (
                    <label key={pref} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={pref}
                        checked={preferences.includes(pref)}
                        onChange={(e) =>
                          setPreferences(
                            e.target.checked ? [...preferences, pref] : preferences.filter((p) => p !== pref),
                          )
                        }
                        className="h-4 w-4 text-sepia-700 border-sepia-300 rounded focus:ring-sepia-600"
                      />
                      <span className="text-sepia-900 text-sm group-hover:text-sepia-700 transition-colors capitalize">
                        {pref.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="mb-10">
                <label className="flex items-center text-sepia-900 text-lg font-playfair font-medium mb-3">
                  <Utensils className="w-5 h-5 mr-2 text-sepia-700" />
                  Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or dietary requirements?"
                  className="w-full px-4 py-3 bg-sepia-50 border border-sepia-200 rounded-lg text-sepia-900 focus:outline-none focus:ring-2 focus:ring-sepia-600 focus:border-transparent transition-all duration-200 min-h-[100px]"
                />
              </div>

              {/* Coupon */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <label className="flex items-center text-sepia-900 text-lg font-playfair font-medium">
                    <Tag className="w-5 h-5 mr-2 text-sepia-700" />
                    Promo Code
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => setIsCouponModalOpen(true)}
                    className="text-sepia-700 text-sm font-medium hover:text-gold-600 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Gift className="w-4 h-4 mr-1.5" />
                    View Available Offers
                  </motion.button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!couponCode}
                    placeholder="Enter promo code"
                    className="w-full px-4 py-3 bg-sepia-50 border border-sepia-200 rounded-lg text-sepia-900 focus:outline-none focus:ring-2 focus:ring-sepia-600 focus:border-transparent disabled:bg-sepia-100 disabled:text-sepia-700 transition-all duration-200"
                  />
                  {couponCode && (
                    <motion.button
                      type="button"
                      onClick={cancelCoupon}
                      className="px-4 py-3 bg-sepia-900 text-white rounded-lg text-sm font-medium hover:bg-sepia-800 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Remove
                    </motion.button>
                  )}
                </div>
                {couponCode && (
                  <p className="mt-2 text-sm text-green-600 flex items-center">
                    <Check className="w-4 h-4 mr-1.5" />
                    Promo code "{couponCode}" applied
                  </p>
                )}
              </div>

              {/* Table Selection */}
              <TableSelection
                selectedTime={selectedTime}
                filteredTables={filteredTables}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                setIsFilterModalOpen={setIsFilterModalOpen}
                partySize={Number(partySize)}
                preferences={preferences}
              />

              {/* Confirmation */}
              <div className="border-t border-sepia-200 pt-8">
                <h2 className="text-xl font-playfair text-sepia-900 font-semibold mb-6">Reservation Summary</h2>
                {selectedTable && selectedTime && selectedDate ? (
                  <div className="mb-8 p-6 bg-gradient-to-r from-sepia-50 to-white rounded-xl border border-sepia-200 shadow-elegant">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Utensils className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                        <div>
                          <p className="text-bronze-700 text-sm font-medium">Table</p>
                          <p className="text-sepia-900">{selectedTable.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                        <div>
                          <p className="text-bronze-700 text-sm font-medium">Date</p>
                          <p className="text-sepia-900">
                            {selectedDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                        <div>
                          <p className="text-bronze-700 text-sm font-medium">Time</p>
                          <p className="text-sepia-900">{selectedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Users className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                        <div>
                          <p className="text-bronze-700 text-sm font-medium">Party Size</p>
                          <p className="text-sepia-900">{partySize} people</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                        <div>
                          <p className="text-bronze-700 text-sm font-medium">Tables Needed</p>
                          <p className="text-sepia-900">{tableQuantity}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <DollarSign className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                        <div>
                          <p className="text-bronze-700 text-sm font-medium">Price</p>
                          <p className="text-sepia-900">₹{originalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      {couponCode && (
                        <>
                          <div className="flex items-start">
                            <Tag className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-bronze-700 text-sm font-medium">Discount</p>
                              <p className="text-green-600">-₹{discount.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Check className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                            <div>
                              <p className="text-bronze-700 text-sm font-medium">Final Price</p>
                              <p className="text-sepia-900 font-semibold">₹{finalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        </>
                      )}
                      {preferences.length > 0 && (
                        <div className="flex items-start md:col-span-2">
                          <Star className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                          <div>
                            <p className="text-bronze-700 text-sm font-medium">Preferences</p>
                            <p className="text-sepia-900">
                              {preferences.map((p) => p.replace(/([A-Z])/g, " $1").trim()).join(", ")}
                            </p>
                          </div>
                        </div>
                      )}
                      {specialRequests && (
                        <div className="flex items-start md:col-span-2">
                          <MessageSquare className="w-5 h-5 text-sepia-700 mr-3 mt-0.5" />
                          <div>
                            <p className="text-bronze-700 text-sm font-medium">Special Requests</p>
                            <p className="text-sepia-900">{specialRequests}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-bronze-700 text-sm mb-6">Complete your selections to see summary</p>
                )}
                <motion.button
                  type="submit"
                  disabled={!selectedTable || !selectedTime}
                  className="w-full py-4 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg text-base font-medium hover:from-sepia-800 hover:to-sepia-950 disabled:from-sepia-300 disabled:to-sepia-400 disabled:text-white/70 transition-all duration-300 shadow-md flex items-center justify-center"
                  whileHover={{ scale: !(!selectedTable || !selectedTime) ? 1.02 : 1 }}
                  whileTap={{ scale: !(!selectedTable || !selectedTime) ? 0.98 : 1 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirm Reservation
                    </>
                  )}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="p-8 bg-gradient-to-r from-sepia-50 to-white rounded-xl text-center border border-sepia-200 shadow-elegant">
              <div className="w-16 h-16 mx-auto mb-4 text-sepia-600">
                <Users className="w-full h-full" />
              </div>
              <h2 className="text-xl font-playfair text-sepia-900 font-semibold mb-4">Large Party Booking</h2>
              <p className="text-sepia-700 text-base mb-6 max-w-md mx-auto">
                For groups over 20, please contact us directly for a personalized reservation experience.
              </p>
              <div className="space-y-4 max-w-xs mx-auto">
                <div className="flex items-center justify-center gap-3 text-sepia-900">
                  <Phone className="w-5 h-5 text-sepia-700" />
                  <a href="tel:1234567890" className="text-sepia-700 hover:text-gold-700 transition-colors">
                    (123) 456-7890
                  </a>
                </div>
                <div className="flex items-center justify-center gap-3 text-sepia-900">
                  <Mail className="w-5 h-5 text-sepia-700" />
                  <a
                    href="mailto:reservations@restaurantname.com"
                    className="text-sepia-700 hover:text-gold-700 transition-colors"
                  >
                    reservations@restaurantname.com
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.form>
      </div>

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        availableCoupons={availableCoupons}
        applyCoupon={applyCoupon}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  )
}

export default BookingPage
