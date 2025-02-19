import   { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Table name is required'),
    capacity: Yup.number()
      .min(1, 'Capacity must be at least 1')
      .required('Capacity is required'),
    quantity: Yup.number()
      .min(1, 'Quantity must be at least 1')
      .required('Quantity is required'),
    description: Yup.string().optional(),
  });

  // Formik Initialization
  const formik = useFormik({
    initialValues: {
      name: '',
      capacity: 2,
      quantity: 1,
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response: any = await tableTypeApi.createTableType(branchId, values);
        setTableTypes([...tableTypes, response.data]);
        formik.resetForm(); // Reset form after successful submission
      } catch (err) {
        setError('Failed to create table type');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const loadTableTypes = async () => {
      try {
        setLoading(true);
        const response: any = await tableTypeApi.getTableTypes(branchId);
        setTableTypes(response.data);
      } catch (err) {
        setError('Failed to fetch table types');
      } finally {
        setLoading(false);
      }
    };
    loadTableTypes();
  }, [branchId]);

  const handleUpdateQuantity = async (tableTypeId: string, quantity: number) => {
    try {
      setLoading(true);
      const updatedTable: any = await tableTypeApi.updateTableTypeQuantity(tableTypeId, quantity);
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
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Table Management</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add New Table Form */}
      <form onSubmit={formik.handleSubmit} className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Add New Table Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Table Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Table Name</label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
            ) : null}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              name="capacity"
              min="1"
              value={formik.values.capacity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.capacity && formik.errors.capacity ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.capacity}</div>
            ) : null}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.quantity && formik.errors.quantity ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.quantity}</div>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Table Type'}
          </button>
        </div>
      </form>

      {/* Table List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Existing Table Types</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : tableTypes.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No table types found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tableTypes.map((table) => (
              <div key={table._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-800">{table.name}</h4>
                  <div className="space-y-2">
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="font-medium">Capacity:</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {table.capacity}
                      </span>
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <span className="font-medium">Quantity:</span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {table.quantity}
                      </span>
                    </p>
                    {table.description && (
                      <p className="text-gray-600 text-sm mt-2">{table.description}</p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(table._id, table.quantity + 1)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleUpdateQuantity(table._id, Math.max(0, table.quantity - 1))}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table._id)}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-slate-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-slate-700 transition-all"
                    >
                      Delete
                    </button>
                  </div>
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