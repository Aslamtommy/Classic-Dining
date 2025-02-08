import React from 'react';

interface TableActionsProps {
  onBlock: () => void;
  isBlocked: boolean;
}

const TableActions: React.FC<TableActionsProps> = ({ onBlock, isBlocked }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onBlock}
        className={`px-2 py-1 text-white rounded ${isBlocked ? 'bg-red-500' : 'bg-green-500'}`}
      >
        {isBlocked ? 'Unblock' : 'Block'}
      </button>
    </div>
  );
};

export default TableActions;
