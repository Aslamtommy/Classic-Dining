import React from "react";
import { Navigate } from "react-router-dom";
 

const ProtectedLogin: React.FC = () => {
 

  return  <Navigate to="/" replace /> 
};

export default ProtectedLogin;