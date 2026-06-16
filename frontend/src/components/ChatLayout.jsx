import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatContainer from './ChatContainer';
import RightSidebar from './RightSidebar';

const ChatLayout = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  return (
    <div className='h-screen flex bg-black/20 relative'>
      {/* Mobile Menu Button - Only visible on small screens */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className='md:hidden fixed top-3 left-3 z-50 bg-white/10 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/20 transition'
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>

      {/* Mobile Right Sidebar Toggle */}
      <button
        onClick={() => setShowRightSidebar(!showRightSidebar)}
        className='md:hidden fixed top-3 right-3 z-50 bg-white/10 backdrop-blur-md p-2 rounded-lg text-white hover:bg-white/20 transition'
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      </button>

      {/* Sidebar - Hidden on mobile when toggled off */}
      <div
        className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        transition-transform duration-300 ease-in-out
        fixed md:relative z-40
        w-[280px] sm:w-[300px] md:w-1/4 min-w-[260px]
        h-full
      `}
      >
        <Sidebar
          setSelectedUser={setSelectedUser}
          selectedUser={selectedUser}
          onUserSelect={() => {
            // Auto-close sidebar on mobile when user is selected
            if (window.innerWidth < 768) {
              setShowSidebar(false);
            }
          }}
        />
      </div>

      {/* Chat Container - Full width on mobile */}
      <div
        className={`
        flex-1 h-full
        ${showSidebar ? 'md:ml-0' : ''}
        ${showRightSidebar ? 'md:mr-0' : ''}
      `}
      >
        <ChatContainer selectedUser={selectedUser} />
      </div>

      {/* Right Sidebar - Slide in from right on mobile */}
      <div
        className={`
        ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0
        transition-transform duration-300 ease-in-out
        fixed md:relative z-40
        w-[280px] sm:w-[300px] md:w-1/4 min-w-[260px]
        h-full right-0
      `}
      >
        <RightSidebar />
      </div>

      {/* Overlay for mobile */}
      {(showSidebar || showRightSidebar) && (
        <div
          className='md:hidden fixed inset-0 bg-black/50 z-30'
          onClick={() => {
            setShowSidebar(false);
            setShowRightSidebar(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatLayout;
