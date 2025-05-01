import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// User Components
import UserHomePage from "./pages/User/UserHomePage"
import UserProfile from "./components/User/UserProfile"
import WalletPage from "./components/User/Wallet"
import Bookings from "./components/User/Bookings"
import ConfirmationPage from "./components/User/ConfirmationPage"
import BookingPage from "./components/User/Booking/BookingPage"
import SuccessPage from "./components/User/SuccessPage"
import RestaurantListPage from "./components/User/RestaurantListPage"
import UserLayout from "./components/User/Home/UserLayout"
import UserProtected from "./components/User/UserProtected"
import RestaurantSearch from "./components/User/RestaurentSearch"
import ProtectedLogin from "./components/User/ProtectedLogin"
import RestaurantDetailPage from "./components/User/RestaurentDetailPage"
import ReservationDetails from "./components/User/ReservationDetails"
import UserNotifications from "./components/User/UserNotification"

// Restaurant Components
import RestaurentSignup from "./components/Restaurent/restaurentSignup"
import RestaurentDashboard from "./pages/Restaurent/RestaurentDashboard"
import RestaurentProfile from "./components/Restaurent/RestaurentProfile"
import PendingApproval from "./components/Restaurent/PendingApproval"
import RestaurentProtected from "./components/Restaurent/RestaurentProtected"
import Layout from "./components/Restaurent/Home/Layout"
import RestaurentLoginProtected from "./components/Restaurent/RestaurentLoginProtected"
import MainRestaurantDashboard from "./components/Restaurent/Home/MainRestaurantDashboard"
import RestaurantChatPage from "./components/Restaurent/RestaurantChatPage"
import RestaurantAdminChatPage from "./components/Restaurent/RestaurantAdminChatPage"
import RestaurantNotifications from "./components/Restaurent/RestaurantNotifications"
import RestaurantLanding from "./pages/Restaurent/landing/RestaurantLandingPage"

// Branch Components
import AddBranch from "./components/BranchManagement/AddBranch"
import Branches from "./components/BranchManagement/Branches"
import BranchDetails from "./components/BranchManagement/BranchDetails"
import BranchBookings from "./components/BranchManagement/BranchBookings"
import EditBranch from "./components/BranchManagement/EditBranch"
import BranchProtected from "./components/BranchManagement/BranchProtected"
import BranchUserChatPage from "./components/BranchManagement/BranchUserChatPage"
import BranchDashboard from "./components/BranchManagement/BranchDashboard"
import BranchProfile from "./components/BranchManagement/BranchProfile"
import BranchRestaurantChatPage from "./components/BranchManagement/BranchRestaurantChatPage"
import BranchNotifications from "./components/BranchManagement/BranchNotification"
import TableManagement from "./components/Restaurent/TableManagement"

// Admin Components
import AdminLogin from "./components/Admin/AdminLogin"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import ApproveRestaurents from "./components/Admin/ApproveRestaurents"
import RestaurentList from "./components/Admin/RestaurentList"
import UserList from "./components/Admin/userList"
import CouponManagement from "./components/Admin/CouponManagement"
import { AdminLayout } from "./components/Admin/Home/AdminLayout"
import AdminProtected from "./components/Admin/AdminProtected"
import AdminRestaurantChatPage from "./components/Admin/AdminRestaurantChatPage"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/join-us" element={<RestaurantLanding />} />
        <Route path="/restaurent/signup" element={<RestaurentSignup />} />
        <Route path="/restaurent/login" element={<RestaurentLoginProtected />} />
        <Route path="/restaurent/pending-approval" element={<PendingApproval />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User Routes */}
        <Route path="/" element={<UserHomePage />} />
        <Route element={<UserProtected />}>
          <Route path="/book/:branchId" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/confirmation/:reservationId" element={<ConfirmationPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/restaurant/:branchId" element={<RestaurantDetailPage />} />
          <Route element={<UserLayout />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/restaurentList" element={<RestaurantListPage />} />
            <Route path="/search" element={<RestaurantSearch />} />
            <Route path="/notifications" element={<UserNotifications />} />
          </Route>
          <Route path="/bookings/:id" element={<ReservationDetails />} />
        </Route>

        {/* Restaurant Routes */}
        <Route path="/restaurent/home" element={<RestaurentDashboard />} />
        <Route element={<RestaurentProtected />}>
          <Route element={<Layout />}>
            <Route path="/restaurent/profile" element={<RestaurentProfile />} />
            <Route path="/restaurent/addbranch" element={<AddBranch />} />
            <Route path="/restaurent/branches" element={<Branches />} />
            <Route path="/restaurent/branches/:branchId" element={<BranchDetails />} />
            <Route path="/restaurent/branches/:branchId/tables" element={<TableManagement />} />
            <Route path="/restaurent/branches/edit/:branchId" element={<EditBranch />} />
            <Route path="/restaurent/dashboard" element={<MainRestaurantDashboard />} />
            <Route path="/restaurant/chat" element={<RestaurantChatPage />} />
            <Route path="/restaurent/chats/admins" element={<RestaurantAdminChatPage />} />
            <Route path="/restaurent/notifications" element={<RestaurantNotifications />} />
          </Route>
        </Route>

        {/* Branch Routes */}
        <Route element={<BranchProtected />}>
          <Route element={<Layout />}>
            <Route path="/branches/:branchId/bookings" element={<BranchBookings />} />
            <Route path="/branches/:branchId/tables" element={<TableManagement />} />
            <Route path="/branch/chat/users" element={<BranchUserChatPage />} />
            <Route path="/branches/dashboard" element={<BranchDashboard />} />
            <Route path="/branches/profile" element={<BranchProfile />} />
            <Route path="/branch/chat/restaurant" element={<BranchRestaurantChatPage />} />
            <Route path="/branch/notifications" element={<BranchNotifications />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminProtected />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/messages" element={<AdminRestaurantChatPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<ApproveRestaurents />} />
            <Route path="/admin/restaurents" element={<RestaurentList />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/coupons" element={<CouponManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
