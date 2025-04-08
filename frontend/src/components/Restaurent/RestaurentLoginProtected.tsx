import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import RestaurentLogin from "./RestaurentLogin";

const RestaurentLoginProtected: React.FC = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent);

  console.log("Restaurent object:", restaurent);
  console.log("Role from state:", role);

  const isAuthenticated = !!restaurent && (role === "restaurent" || role === "branch");

  if (isAuthenticated) {
    const redirectPath = role === "branch" ? "/branches/dashboard" : "/restaurent/home";
    return <Navigate to={redirectPath} replace />;
  }

  return <RestaurentLogin />;
};

export default RestaurentLoginProtected;