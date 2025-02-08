 
import adminApi from '../Axios/adminInstance';
 

// Fetch all managers
export const fetchManagers = async (page: number, limit: number) => {
  const { data } = await adminApi.get('/managers', {
    params: { page, limit }
  });
  return data; // Return the full response (managers + total)
};
// Fetch all users
export const fetchUsers = async (page: number, limit: number) => {
  const { data } = await adminApi.get('/users', {
    params: { page, limit }
  });
  return data; // Return full response (users + total)
};

// Block or unblock a manager
export const blockManager = async (managerId: string, isBlocked: boolean) => {
    try {

        console.log('managerid',managerId)
        await adminApi.post('/block', { managerId, isBlocked });
      } catch (error: any) {
        console.error('Error blocking manager:', error.response?.data || error.message);
      }
};
export const blockUser = async (userId: string, isBlocked: boolean) => {
    await adminApi.post('/block-user', { userId, isBlocked });
  };