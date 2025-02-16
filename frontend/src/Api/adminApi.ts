 
import adminApi from '../Axios/adminInstance';
 

export const fetchRestaurents = async (page: number, limit: number,searchTerm: string,
  isBlocked: string) => {
  try {
    const response = await adminApi.get<any>('/restaurent', {
      params: { page, limit,searchTerm,isBlocked }
    });

    // Extract the nested `data` object from the response
    const { data } = response.data;

    console.log('Extracted data:', data); // Log the extracted data
    return data; // Return the nested `data` object
  } catch (error) {
    console.error('Error fetching restaurents:', error);
    throw new Error('Failed to fetch restaurents. Please try again later.');
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

// Block or unblock a restaurent
export const blockRestaurent = async (restaurentId: string, isBlocked: boolean) => {
    try {

        console.log('restaurentId',restaurentId)
        await adminApi.post('/block', { restaurentId, isBlocked });
      } catch (error: any) {
        console.error('Error blocking restaurent:', error.response?.data || error.message);
      }
};
export const blockUser = async (userId: string, isBlocked: boolean) => {
    await adminApi.post('/block-user', { userId, isBlocked });
  };
  