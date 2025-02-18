// src/components/TableManagement.tsx
import React, { useState, useEffect } from 'react';
import { tableTypeApi } from '../../Api/restaurentApi';

interface TableType {
  _id: string;
  name: string;
  capacity: number;
  quantity: number;
  description?: string;
}

const TableManagement = ({ branchId }: { branchId: string }) => {
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 2,
    quantity: 1,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch table types for the branch
  useEffect(() => {
    const loadTableTypes = async () => {
      try {
        setLoading(true);
        const response :any= await tableTypeApi.getTableTypes(branchId);
        console.log('API response:', response.data);
        setTableTypes(response.data );
      } catch (err) {
        setError('Failed to fetch table types');
      } finally {
        setLoading(false);
      }
    };
    loadTableTypes();
  }, [branchId]);

  // Handle form submission for creating a new table type
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response :any= await tableTypeApi.createTableType(branchId, newTable);
      setTableTypes([...tableTypes, response.data ]);
      setNewTable({ name: '', capacity: 2, quantity: 1, description: '' });
    } catch (err) {
      setError('Failed to create table type');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating table quantity
  const handleUpdateQuantity = async (tableTypeId: string, quantity: number) => {
    try {
      setLoading(true);
      const updatedTable:any = await tableTypeApi.updateTableTypeQuantity(tableTypeId, quantity);
      setTableTypes((prev) =>
        prev.map((table) =>
          table._id === tableTypeId ? { ...table, quantity: updatedTable.data.quantity } : table
        )
      );
    } catch (err) {
      setError('Failed to update table quantity');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a table type
  const handleDeleteTable = async (tableTypeId: string) => {
    try {
      setLoading(true);
      await tableTypeApi.deleteTableType(tableTypeId);
      setTableTypes((prev) => prev.filter((table) => table._id !== tableTypeId));
    } catch (err) {
      setError('Failed to delete table type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Table Management</h2>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Add New Table Form */}
      <form onSubmit={handleCreateTable} className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Add New Table Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Table Name</label>
            <input
              type="text"
              value={newTable.name}
              onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input
              type="number"
              min="1"
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={newTable.quantity}
              onChange={(e) => setNewTable({ ...newTable, quantity: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Adding...' : 'Add Table Type'}
          </button>
        </div>
      </form>

      {/* Table List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Existing Table Types</h3>
        {loading ? (
          <p>Loading...</p>
        ) : tableTypes.length === 0 ? (
          <p>No table types found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tableTypes.map((table) => (
              <div key={table._id} className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="text-lg font-bold mb-2">{table.name}</h4>
                <p className="text-gray-600">Capacity: {table.capacity}</p>
                <p className="text-gray-600">Quantity: {table.quantity}</p>
                {table.description && (
                  <p className="text-gray-600 mt-2">{table.description}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(table._id, table.quantity + 1)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleUpdateQuantity(table._id, table.quantity - 1)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManagement;