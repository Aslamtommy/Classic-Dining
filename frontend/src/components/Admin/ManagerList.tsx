import React, { useState, useCallback } from 'react';
import { fetchManagers, blockManager } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from './DataTable';
import TableActions from './TableActions';
import Loader from './Loader';
import Pagination from '../../Pagination/Pagination';

const ManagerList: React.FC = () => {
   
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>('all');
  const limit =4;

  // Memoize the fetch function so it only changes when page or limit changes.
  const fetchManagersCallback = useCallback(() => fetchManagers(page, limit,searchTerm,isBlockedFilter), [page, limit, searchTerm, isBlockedFilter]);

  const { data, loading, error, refetch } = useFetchData(fetchManagersCallback);

 
  const managers = data?.managers || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleBlockManager = async (managerId: string, isBlocked: boolean) => {
    try {
      await blockManager(managerId, isBlocked);
    
      refetch();
    } catch (err) {
      console.error('Error blocking/unblocking manager:', err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart();
    setSearchTerm(value);
    setPage(1);
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
      <h2 className="text-2xl font-bold mb-4">Managers</h2>

       {/* Search and Filter Controls */}
       <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="border p-2 rounded w-64"
        />
        <select
          value={isBlockedFilter}
          onChange={(e) => {
            setIsBlockedFilter(e.target.value);
            setPage(1); // Reset page on filter change
          }}
          className="border p-2 rounded"
        >
         <option value="">All</option>
        <option value="active">Active</option>
        <option value="blocked">Blocked</option>
        </select>
      </div>
      <DataTable
        columns={['name', 'email']}
        data={managers}
        actions={(manager) => (
          <TableActions
            onBlock={() => handleBlockManager(manager._id, !manager.isBlocked)}
            isBlocked={manager.isBlocked}
          />
        )}
      />

      {/* Reusable Pagination Component */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default ManagerList;
