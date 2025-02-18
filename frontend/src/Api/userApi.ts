import api from "../Axios/userInstance";

export const fetchBranches = async () => {
    const response = await api.get("/branches");
    return response.data;
  };