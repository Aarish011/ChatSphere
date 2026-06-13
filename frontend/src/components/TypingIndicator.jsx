import React from 'react';

const TypingIndicator = ({ userName }) => {
  return (
    <div className='px-4 py-2'>
      <div className='flex items-center gap-1'>
        <div className='flex space-x-1'>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
        <p className='text-xs text-gray-300 ml-2'>{userName} is typing...</p>
      </div>
    </div>
  );
};

export default TypingIndicator;
