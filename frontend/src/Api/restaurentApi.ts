import restaurentApi from "../Axios/restaurentInstance";



export const fetchBranches = async () => {
    const response = await restaurentApi.get("/allbranches");
    return response.data;
  };
  