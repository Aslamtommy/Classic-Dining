import api from "../Axios/userInstance";

export const fetchBranches = async () => {
  try {
    const response:any = await api.get("/branches");
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch branches');
    }
    return response.data 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch branches');
  }
};

 

export const fetchBranchDetails = async (branchId: string) => {
  try {
    const response :any= await api.get(`/branches/${branchId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch branch details');
    }
    return response.data 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch branch details');
  }
};

export const createReservation = async (reservationData: any) => {
  try {
    const response :any= await api.post(`/reservations`, reservationData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create reservation');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create reservation');
  }
};

export const fetchAvailableTables = async (branchId: string, date: string, timeSlot: string) => {
  try {
    const response :any= await api.get(`/available-tables`, {
      params: { branchId, date, timeSlot },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch available tables');
    }
    return response.data.data; // Returns array of available TableType objects
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch available tables');
  }
};

export const confirmReservation = async (reservationId: string, paymentId: string) => {
  try {
    const response: any = await api.put(`/reservations/${reservationId}/confirm`, { paymentId });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to confirm reservation');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to confirm reservation');
  }
};

export const failReservation = async (reservationId: string, paymentId: string) => {
  try {
    const response: any = await api.put(`/reservations/${reservationId}/fail`, { paymentId });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark reservation as payment failed');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to mark reservation as payment failed');
  }
};