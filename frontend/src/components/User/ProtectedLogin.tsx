import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import LoginForm from "./LoginForm";

const ProtectedLogin: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return user ? <Navigate to="/" replace /> : <LoginForm />;
};

export default ProtectedLogin;