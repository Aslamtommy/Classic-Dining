import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { fetchUsers, blockUser } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from './DataTable';
import TableActions from './TableActions';
import Loader from './Loader';
import Pagination from '../../Pagination/Pagination';
import debounce from 'lodash/debounce';

interface User {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

interface FetchUsersResponse {
  users: User[];
  total: number;
}

const UserList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>('all');
  const [blockingUsers, setBlockingUsers] = useState<Set<string>>(new Set());
  const [refetchKey, setRefetchKey] = useState<number>(0);
  const limit = 5;

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPage(1);
    }, 500),
    []
  );

  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const fetchUsersCallback = useCallback(
    () => fetchUsers(page, limit, searchTerm, isBlockedFilter),
    [page, searchTerm, isBlockedFilter, refetchKey]
  );

  const { data, loading, error, setData } = useFetchData(fetchUsersCallback);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Effect to trigger refetch when users array empties but total > 0
  useEffect(() => {
    if (users.length === 0 && total > 0 && !loading) {
      setRefetchKey(prev => prev + 1);
    }
  }, [users.length, total, loading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart();
    debouncedSearch(value);
  };

  const handleBlockUser = async (userId: string, currentIsBlocked: boolean) => {
    if (blockingUsers.has(userId)){
      return;
    } 
    setBlockingUsers(prev => new Set(prev).add(userId));
    const newIsBlocked = !currentIsBlocked;
    try {
      await blockUser(userId, newIsBlocked);

      setData((prevData: FetchUsersResponse | null) => {
        if (!prevData || !prevData.users){
          return prevData;
        } 
        const updatedUsers = prevData.users.map((user: User) =>
          user._id === userId ? { ...user, isBlocked: newIsBlocked } : user
        );
        let shouldStay = true;
        if (isBlockedFilter === 'active') {
          shouldStay = !newIsBlocked;
        } else if (isBlockedFilter === 'blocked') {
          shouldStay = newIsBlocked;
        }
        const newUsers = shouldStay ? updatedUsers : updatedUsers.filter(user => user._id !== userId);
        const newTotal = shouldStay ? prevData.total : prevData.total - 1;
        return { ...prevData, users: newUsers, total: newTotal };
      });
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
    } finally {
      setBlockingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Users</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email"
            defaultValue={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
          />
          <select
            value={isBlockedFilter}
            onChange={(e) => {
              setIsBlockedFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            columns={['name', 'email']}
            data={users}
            actions={(user) => (
              <TableActions
                onBlock={() => handleBlockUser(user._id, user.isBlocked)}
                isBlocked={user.isBlocked}
                isLoading={blockingUsers.has(user._id)}
              />
            )}
          />
        </div>
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  ) 
} 

export default UserList 