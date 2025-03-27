import api from "../Axios/userInstance";
import { AxiosError } from "../types/auth";
import { BranchResponse  } from "../types/branch";
import {
  ReservationResponse,
  ReservationsResponse,
  AvailableTablesResponse,
  Coupon,
  CouponsResponse,
  WalletResponse,
  Reservation,
  TableType,
} from "../types/reservation";
import { Review } from "../types/reservation";

export const fetchBranchDetails = async (branchId: string): Promise<BranchResponse['data']> => {
  try {
    const response = await api.get<BranchResponse>(`/branches/${branchId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch branch details');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch branch details');
  }
};

export const createReservation = async (reservationData: Partial<Reservation>): Promise<ReservationResponse> => {
  try {
    const response = await api.post<ReservationResponse>(`/reservations`, reservationData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create reservation');
    }
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to create reservation');
  }
};

export const fetchAvailableTables = async (
  branchId: string,
  date: string,
  timeSlot: string
): Promise<TableType[]> => {
  try {
    const response = await api.get<AvailableTablesResponse>(`/available-tables`, {
      params: { branchId, date, timeSlot },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch available tables');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch available tables');
  }
};

export const confirmReservation = async (reservationId: string, paymentId: string): Promise<ReservationResponse> => {
  try {
    const response = await api.put<ReservationResponse>(`/reservations/${reservationId}/confirm`, { paymentId });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to confirm reservation');
    }
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to confirm reservation');
  }
};

export const failReservation = async (reservationId: string, paymentId: string): Promise<ReservationResponse> => {
  try {
    const response = await api.put<ReservationResponse>(`/reservations/${reservationId}/fail`, { paymentId });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark reservation as payment failed');
    }
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to mark reservation as payment failed');
  }
};

export const fetchUserReservations = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ReservationsResponse['data']> => {
  try {
    const params: { page: number; limit: number; status?: string } = { page, limit };
    if (status) params.status = status;
    const response = await api.get<ReservationsResponse>('/reservations', { params });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch reservations');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch reservations');
  }
};

export const fetchReservation = async (reservationId: string): Promise<Reservation> => {
  try {
    const response = await api.get<ReservationResponse>(`/reservations/${reservationId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch reservation');
    }
    console.log('si',response.data.data);
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch reservation');
  }
};

export const cancelReservation = async (reservationId: string): Promise<Reservation> => {
  try {
    const response = await api.put<ReservationResponse>(`/reservations/${reservationId}/cancel`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel reservation');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to cancel reservation');
  }
};

export const fetchWalletData = async (): Promise<WalletResponse['data']> => {
  try {
    const response = await api.get<WalletResponse>('/wallet');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch wallet data');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch wallet data');
  }
};

export const fetchAvailableCoupons = async (): Promise<Coupon[]> => {
  try {
    const response = await api.get<CouponsResponse>('/coupons');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch available coupons');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch available coupons');
  }
};

export const fetchBranches = async (
  search: string = '',
  page: number = 1,
  limit: number = 10
)  => {
  try {
    const response :any= await api.get ("/branches", {
      params: { search, page, limit },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch branches');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch branches');
  }
};

export const submitReview = async (
  reservationId: string,
  review: { rating: number; comment?: string }
): Promise<ReservationResponse> => {
  try {
    const response = await api.post<ReservationResponse>(`/reservations/${reservationId}/review`, review);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit review');
    }
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to submit review');
  }
};

export const fetchBranchReviews = async (branchId: string): Promise<Review[]> => {
  try {
    const response = await api.get<{ success: boolean; message: string; data: Review[] }>(`/branches/${branchId}/reviews`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch reviews');
    }
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.response?.data?.message || 'Failed to fetch reviews');
  }
};