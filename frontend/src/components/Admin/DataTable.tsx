import React from 'react';

interface DataTableProps {
  columns: string[];
  data: any[];
  actions?: (item: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, actions }) => {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className="p-2 border border-gray-300">
              {column}
            </th>
          ))}
          {actions && <th className="p-2 border border-gray-300">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="hover:bg-gray-100">
            {columns.map((column, colIndex) => (
              <td key={colIndex} className="p-2 border border-gray-300">
                {item[column]}
              </td>
            ))}
            {actions && <td className="p-2 border border-gray-300">{actions(item)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
