import React, { useState, useCallback } from 'react';
import { fetchRestaurents, blockRestaurent } from '../../Api/adminApi';
import useFetchData from '../../hooks/useFetchData';
import DataTable from './DataTable';
import TableActions from './TableActions';
import Loader from './Loader';
import Pagination from '../../Pagination/Pagination';

// Define Restaurent interface
interface Restaurent {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

// Define response shape from fetchRestaurents
interface FetchRestaurentsResponse {
  restaurents: Restaurent[];
  total: number;
}

const RestaurentList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>('all');
  const [blockingRestaurents, setBlockingRestaurents] = useState<Set<string>>(new Set());
  const limit = 4;

  // Memoize the fetch function
  const fetchRestaurentsCallback = useCallback(
    () => fetchRestaurents(page, limit, searchTerm, isBlockedFilter),
    [page, limit, searchTerm, isBlockedFilter]
  );

  const { data, loading, error, setData } = useFetchData(fetchRestaurentsCallback);

  const restaurents = data?.restaurents || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleBlockRestaurent = async (restaurentId: string, currentIsBlocked: boolean) => {
    if (blockingRestaurents.has(restaurentId)) return;
    setBlockingRestaurents(prev => new Set(prev).add(restaurentId));

    const newIsBlocked = !currentIsBlocked;
    try {
      await blockRestaurent(restaurentId, newIsBlocked);
      setData((prevData: FetchRestaurentsResponse | null) => {
        if (!prevData || !prevData.restaurents) return prevData;

        const updatedRestaurents = prevData.restaurents.map((restaurent: Restaurent) =>
          restaurent._id === restaurentId ? { ...restaurent, isBlocked: newIsBlocked } : restaurent
        );

        let shouldStay = true;
        if (isBlockedFilter === 'active') {
          shouldStay = !newIsBlocked; // Active filter: should be unblocked
        } else if (isBlockedFilter === 'blocked') {
          shouldStay = newIsBlocked; // Blocked filter: should be blocked
        } // 'all' filter always stays

        if (!shouldStay) {
          return {
            ...prevData,
            restaurents: updatedRestaurents.filter(restaurent => restaurent._id !== restaurentId),
            total: prevData.total - 1
          };
        }

        return { ...prevData, restaurents: updatedRestaurents };
      });
    } catch (err) {
      console.error('Error blocking/unblocking restaurent:', err);
    } finally {
      setBlockingRestaurents(prev => {
        const newSet = new Set(prev);
        newSet.delete(restaurentId);
        return newSet;
      });
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Restaurants</h2>
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
            data={restaurents}
            actions={(restaurent) => (
              <TableActions
                onBlock={() => handleBlockRestaurent(restaurent._id, restaurent.isBlocked)}
                isBlocked={restaurent.isBlocked}
                isLoading={blockingRestaurents.has(restaurent._id)}
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
  );
};

export default RestaurentList;