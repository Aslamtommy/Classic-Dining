 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './components/User/SignupForm';   
import LoginForm from './components/User/LoginForm';
import UserHomePage from './pages/User/UserHomePage';
import UserProfile from './components/User/UserProfile';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManagerSignup from './components/Manager/managerSignup';
import ManagerLogin from './components/Manager/managerLogin';
import ApproveManagers from './components/Admin/Adminapprovals';
import ManagerProfile from './components/Manager/ManagerProfile';
import ManagerList from './components/Admin/ManagerList';
import UserList from './components/Admin/userList';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerProtected from './components/Manager/ManagerProtected';
import UserProtected from './components/User/UserPrrotected';
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
       



          <Route path="/manager/signup" element={<ManagerSignup />} />
          <Route path="/manager/login" element={<ManagerLogin/>} />
    
       <Route element={<ManagerProtected />}>
          <Route path="/manager/profile" element={<ManagerProfile />} />
          <Route path="/manager/home" element={<ManagerDashboard />} />
        </Route>
        <Route >
        <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtected/>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
          <Route path="/admin/approvals" element={<ApproveManagers/>} />
          <Route path="/admin/managers" element={<ManagerList />} />
          <Route path="/admin/users" element={<UserList />} />
          </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
