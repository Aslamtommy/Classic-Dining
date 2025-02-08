import React, { useState, useCallback } from 'react';
import { fetchUsers, blockUser } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from '../../components/Admin/DataTable';
import Loader from '../../components/Admin/Loader';
import Pagination from '../../Pagination/Pagination';
const UserList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 2;
  
  // Fix: Use fetchUsersCallback to avoid redeclaring users
  const fetchUsersCallback = useCallback(() => fetchUsers(page, limit), [page, limit]);
  const { data, loading, error, setData } = useFetchData(fetchUsersCallback);

  // Fix: Rename users variable to avoid conflict
  const userList = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };


  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await blockUser(userId, isBlocked);

      // Update state without refreshing
      setData((prevData: any) => ({
        ...prevData,
        users: prevData.users.map((user: any) =>
          user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        ),
      }));

      alert(isBlocked ? 'User blocked successfully' : 'User unblocked successfully');
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    }
  };

  const columns = ['name', 'email', 'actions'];

  // Fix: Use userList instead of users
  const tableData = userList.map((user: any) => ({
    ...user,
    actions: (
      <button
        onClick={() => handleBlock(user._id, !user.isBlocked)}
        className={`btn ${user.isBlocked ? 'btn-danger' : 'btn-success'}`}
      >
        {user.isBlocked ? 'Unblock' : 'Block'}
      </button>
    ),
  }));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <DataTable columns={columns} data={tableData} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default UserList;
