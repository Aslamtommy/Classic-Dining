import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// User Components
import SignupForm from './components/User/SignupForm';
 
import UserHomePage from './pages/User/UserHomePage';
import UserProfile from './components/User/UserProfile';
import WalletPage from './components/User/Wallet';
import Bookings from './components/User/Bookings';
import ConfirmationPage from './components/User/ConfirmationPage';
import BookingPage from './components/User/Booking/BookingPage';
import SuccessPage from './components/User/SuccessPage';
import RestaurantListPage from './components/User/RestaurantListPage';
import UserLayout from './components/User/Home/UserLayout';
import UserProtected from './components/User/UserProtected';
import RestaurantSearch from './components/User/RestaurentSearch';
import ProtectedLogin from './components/User/ProtectedLogin';
import RestaurantDetailPage from './components/User/RestaurentDetailPage';
// Restaurant Components
import RestaurentSignup from './components/Restaurent/restaurentSignup';
import RestaurentLogin from './components/Restaurent/RestaurentLogin';
import RestaurentDashboard from './pages/Restaurent/RestaurentDashboard';
import RestaurentProfile from './components/Restaurent/RestaurentProfile';
import PendingApproval from './components/Restaurent/PendingApproval';
import RestaurentProtected from './components/Restaurent/RestaurentProtected';
import Layout from './components/Restaurent/Home/Layout';

// Branch Components
import AddBranch from './components/BranchManagement/AddBranch';
import Branches from './components/BranchManagement/Branches';
import BranchDetails from './components/BranchManagement/BranchDetails';
import BranchBookings from './components/BranchManagement/BranchBookings';
import EditBranch from './components/BranchManagement/EditBranch';
import BranchProtected from './components/BranchManagement/BranchProtected';
import BranchChatPage from './components/BranchManagement/BranchChatPage';
import BranchDashboard from './components/BranchManagement/BranchDashboard';
// Admin Components
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ApproveRestaurents from './components/Admin/ApproveRestaurents';
import RestaurentList from './components/Admin/RestaurentList';
import UserList from './components/Admin/userList';
import CouponManagement from './components/Admin/CouponManagement';
import { AdminLayout } from './components/Admin/Home/AdminLayout';
import AdminProtected from './components/Admin/AdminProtected';
 
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/restaurent/signup" element={<RestaurentSignup />} />
        <Route path="/restaurent/login" element={<RestaurentLogin />} />
        <Route path="/restaurent/pending-approval" element={<PendingApproval />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User Routes */}
        <Route element={<UserProtected />}>
          <Route path="/" element={<UserHomePage />} />
         
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
          </Route>
        </Route>

      {/* Restaurant Routes */}
      <Route path="/restaurent/home" element={<RestaurentDashboard />} />
        <Route element={<RestaurentProtected />}>
          <Route element={<Layout />}>
            <Route path="/restaurent/profile" element={<RestaurentProfile />} />
            <Route path="/restaurent/addbranch" element={<AddBranch />} />
            <Route path="/restaurent/branches" element={<Branches />} />
            <Route path="/restaurent/branches/:branchId" element={<BranchDetails />} />
            <Route path="/restaurent/branches/edit/:branchId" element={<EditBranch />} />
          </Route>
        </Route>

      {/* Branch Routes */}
      <Route element={<BranchProtected />}>
          <Route element={<Layout />}> {/* Reusing Layout; replace with BranchLayout if exists */}
            <Route path="/branches/:branchId/bookings" element={<BranchBookings />} />
            <Route path="/branches/:branchId/chat" element={<BranchChatPage />} />
            <Route path="/branches/dashboard" element={<BranchDashboard />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminProtected />}>
      
          <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<ApproveRestaurents />} />
            <Route path="/admin/restaurents" element={<RestaurentList />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/coupons" element={<CouponManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;