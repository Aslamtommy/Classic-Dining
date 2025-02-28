import React from 'react';

interface TableActionsProps {
  onBlock: () => void;
  isBlocked: boolean;
  isLoading: boolean;
}

const TableActions: React.FC<TableActionsProps> = ({ onBlock, isBlocked, isLoading }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onBlock}
        disabled={isLoading}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isBlocked
            ? 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        } text-white shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Processing...' : isBlocked ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
};

export default TableActions;