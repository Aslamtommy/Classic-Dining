 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './components/User/SignupForm';   
import LoginForm from './components/User/LoginForm';
import UserHomePage from './pages/User/UserHomePage';
import UserProfile from './components/User/UserProfile';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
 import RestaurentSignup from './components/Restaurent/restaurentSignup';
 import RestaurentLogin from './components/Restaurent/RestaurentLogin';
import ApproveRestaurents from './components/Admin/ApproveRestaurents';
import RestaurentProfile from './components/Restaurent/RestaurentProfile';
import RestaurentList from './components/Admin/RestaurentList';
import UserList from './components/Admin/userList';
import RestaurentDashboard from './pages/Restaurent/RestaurentDashboard';
import RestaurentProtected from './components/Restaurent/RestaurentProtected';
import UserProtected from './components/User/UserProtected';
 import AdminProtected from './components/Admin/AdminProtected';
 import AddBranch from './components/BranchManagement/AddBranch';
 import Branches from './components/BranchManagement/Branches';
 import BranchDetails from './components/BranchManagement/BranchDetails';
 import Layout from './components/Restaurent/Home/Layout';
 import EditBranch from './components/BranchManagement/EditBranch';
 import { AdminLayout } from './components/Admin/Home/AdminLayout';
import PendingApproval from './components/Restaurent/PendingApproval';
import WalletPage from './components/User/Wallet';
  import UserLayout from './components/User/Home/UserLayout';
  import ConfirmationPage from './components/User/ConfirmationPage';
  
import BookingPage from './components/User/BookingPage';
import Bookings from './components/User/Bookings';
import SuccessPage from './components/User/SuccessPage';
const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<UserProtected/>}>
          <Route element={<UserLayout />}>
          <Route path="/Profile" element={<UserProfile />} />
          <Route path="/wallet" element={<WalletPage/>} />
          <Route path="/bookings" element={<Bookings />} />
          </Route>
          <Route path="/confirmation" element={<ConfirmationPage />} /> {/* For new reservations */}
          <Route path="/confirmation/:reservationId" element={<ConfirmationPage/>} />
          <Route path="/book/:branchId" element={<BookingPage/>} />
          <Route path="/success" element={<SuccessPage/>} />
          <Route path="/" element={<UserHomePage />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
         
       
          </Route> 
 


          <Route path="/restaurent/signup" element={<RestaurentSignup />} />
          <Route path="/restaurent/login" element={<RestaurentLogin/>} />
          <Route path='/restaurent/pending-approval' element={<PendingApproval/>}/>
       <Route element={< RestaurentProtected />}>
       
          <Route path="/restaurent/home" element={<RestaurentDashboard />} />
          <Route element={<Layout/>}>
          <Route path="/restaurent/profile" element={<RestaurentProfile />} />
          <Route path='/restaurent/addbranch' element={<AddBranch/>}/>
          <Route path='/restaurent/branches' element={<Branches/>}/>
          <Route path='/restaurent/branches/:branchId' element={<BranchDetails/>}/>
          <Route path="/restaurent/branches/edit/:branchId" element={<EditBranch />} />
       
          </Route>
        </Route>
        <Route >
        <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtected/>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route element={<AdminLayout/>}>
        
        
          <Route path="/admin/approvals" element={<ApproveRestaurents/>} />
          <Route path="/admin/restaurents" element={<RestaurentList />} />
          <Route path="/admin/users" element={<UserList />} />
          </Route>  
          </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
