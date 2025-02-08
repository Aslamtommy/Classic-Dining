import React, { useState, useCallback } from 'react';
import { fetchManagers, blockManager } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from './DataTable';
import TableActions from './TableActions';
import Loader from './Loader';
import Pagination from '../../Pagination/Pagination';

const ManagerList: React.FC = () => {
   
  const [page, setPage] = useState<number>(1);
  const limit = 2;

  // Memoize the fetch function so it only changes when page or limit changes.
  const fetchManagersCallback = useCallback(() => fetchManagers(page, limit), [page, limit]);

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
