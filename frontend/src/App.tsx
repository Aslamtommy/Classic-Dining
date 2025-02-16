 
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
 
const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<UserProtected/>}>
          <Route path="/Profile" element={<UserProfile />} />
          <Route path="/" element={<UserHomePage />} />
          </Route>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm />} />
       



          <Route path="/restaurent/signup" element={<RestaurentSignup />} />
          <Route path="/restaurent/login" element={<RestaurentLogin/>} />
    
       <Route element={< RestaurentProtected />}>
          <Route path="/restaurent/profile" element={<RestaurentProfile />} />
          <Route path="/restaurent/home" element={<RestaurentDashboard />} />
        </Route>
        <Route >
        <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtected/>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
          <Route path="/admin/approvals" element={<ApproveRestaurents/>} />
          <Route path="/admin/restaurents" element={<RestaurentList />} />
          <Route path="/admin/users" element={<UserList />} />
          </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
