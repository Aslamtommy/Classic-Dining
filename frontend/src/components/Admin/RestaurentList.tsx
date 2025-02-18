import React, { useState, useCallback } from 'react';
import { fetchRestaurents, blockRestaurent } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from './DataTable';
import TableActions from './TableActions';
import Loader from './Loader';
import Pagination from '../../Pagination/Pagination';

const RestaurentList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>('all');
  const limit = 4;

  // Memoize the fetch function so it only changes when page, limit, searchTerm, or filter changes.
  const fetchRestaurentsCallback = useCallback(
    () => fetchRestaurents(page, limit, searchTerm, isBlockedFilter),
    [page, limit, searchTerm, isBlockedFilter]
  );

  const { data, loading, error, refetch } = useFetchData(fetchRestaurentsCallback);

  const restaurents = data?.restaurents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleBlockRestaurent = async (restaurentId: string, isBlocked: boolean) => {
    try {
      await blockRestaurent(restaurentId, isBlocked);
      refetch();
    } catch (err) {
      console.error('Error blocking/unblocking restaurent:', err);
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
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Restaurants</h2>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
          />
          <select
            value={isBlockedFilter}
            onChange={(e) => {
              setIsBlockedFilter(e.target.value);
              setPage(1); // Reset page on filter change
            }}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable
            columns={['name', 'email']}
            data={restaurents}
            actions={(restaurent) => (
              <TableActions
                onBlock={() => handleBlockRestaurent(restaurent._id, !restaurent.isBlocked)}
                isBlocked={restaurent.isBlocked}
              />
            )}
          />
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurentList;