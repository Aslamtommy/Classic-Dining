import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { logoutUser } from '../../../redux/userslice';

import api from '../../../Axios/userInstance';
const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.user);

  const handleLogout = async () => {
    try {
      await api.post('/logout'); 
      dispatch(logoutUser());  
      
      navigate('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    
    }
  };
  
  return (
    <header className="border-b border-[#2c2420]/20">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <nav className="flex flex-col md:flex-row justify-between items-center gap-4">
          <a href="/" className="text-2xl font-semibold tracking-wide">
            <span className="font-playfair">CLASSIC DINING</span>
          </a>
          <div className="flex items-center space-x-8">
            <a
              href="/"
              className="text-sm hover:text-[#8b5d3b] transition-colors"
            >
              Home
            </a>
            <a
              href="/menu"
              className="text-sm hover:text-[#8b5d3b] transition-colors"
            >
              Menu
            </a>
            <a
              href="/reservations"
              className="text-sm hover:text-[#8b5d3b] transition-colors"
            >
              Reservations
            </a>
            <a
              href="/Profile"
              className="text-sm hover:text-[#8b5d3b] transition-colors"
            >
             Profile
            </a>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
              <a
                href="/signup"
                className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
              >
                Register
              </a>
              <button
              onClick={()=>navigate('/login')} 
                   className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
              >
                Login

              </button>
            </div>

              
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
