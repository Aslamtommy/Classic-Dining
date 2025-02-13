import React, { useState, useCallback } from 'react';
import { fetchUsers, blockUser } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from './DataTable';
import TableActions from './TableActions';
import Loader from './Loader';
import Pagination from '../../Pagination/Pagination';

const UserList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 2;

  // Memoize the fetch function so it only changes when page or limit changes.
  const fetchUsersCallback = useCallback(() => fetchUsers(page, limit), [page, limit]);

  const { data, loading, error, refetch } = useFetchData(fetchUsersCallback);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      await blockUser(userId, isBlocked);
      refetch();
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <DataTable
  columns={['name', 'email']}
  data={users}
  actions={(user) => {
    console.log('Current isBlocked status:', user.isBlocked); // Log before calling function
    return (
      <TableActions
        onBlock={() => {
          console.log(`Toggling block status for user ${user._id}. Current status:`, user.isBlocked);
          handleBlockUser(user._id, !user.isBlocked);
        }}
        isBlocked={user.isBlocked}
      />
    );
  }}
/>


      {/* Reusable Pagination Component */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default UserList;
