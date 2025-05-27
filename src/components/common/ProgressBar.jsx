import React from 'react';

const ProgressBar = ({ completed = 0, height = '8px', isLabelVisible = true }) => {
  return (
    <div className="w-full">
      {isLabelVisible && (
        <div className="mb-1 text-sm font-medium text-gray-300">
          {completed === 0 ? 'Progress 0%' : completed < 100 ? `Progress ${completed}%` : 'Completed'}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${completed === 0 ? 'min-w-[1px]' : ''}`}
          style={{
            width: `${completed}%`,
            backgroundColor: completed < 100 ? '#3b82f6' : '#10b981', // blue if not completed, green if 100%
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;