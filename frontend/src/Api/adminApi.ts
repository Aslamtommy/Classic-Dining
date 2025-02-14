 
import adminApi from '../Axios/adminInstance';
 

export const fetchManagers = async (page: number, limit: number,searchTerm: string,
  isBlocked: string) => {
  try {
    const response = await adminApi.get<any>('/managers', {
      params: { page, limit,searchTerm,isBlocked }
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log('Extracted data:', data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw new Error('Failed to fetch managers. Please try again later.');
  }
};
// Fetch all users
export const fetchUsers = async (page: number, limit: number,searchTerm: string,
  isBlocked: string) => {
  try {
    const response = await adminApi.get<any>('/users', {
      params: { page, limit ,searchTerm,isBlocked}
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log('Extracted data:', data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users. Please try again later.');
  }
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
  