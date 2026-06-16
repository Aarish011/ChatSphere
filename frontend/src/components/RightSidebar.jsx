import React, { useState } from 'react';
import assets from '../assets/assets';
import { useAuth } from '../context/AuthContext';

const RightSidebar = () => {
  const { authUser } = useAuth();

  return (
    <div className='w-full md:w-1/4 min-w-[260px] h-full bg-white/10 backdrop-blur-md border-l border-white/10 text-white flex flex-col overflow-y-auto'>
      {/* Profile - Mobile Optimized */}
      <div className='p-4 sm:p-5 flex flex-col items-center border-b border-white/10'>
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          alt='profile'
          className='w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-white/20'
        />

        <h2 className='mt-2 sm:mt-3 font-bold text-base sm:text-lg'>
          {authUser?.fullName || 'User'}
        </h2>

        <p className='text-[10px] sm:text-xs text-gray-300 text-center'>
          {authUser?.bio || 'No bio added'}
        </p>
      </div>

      {/* Info - Mobile Optimized */}
      <div className='p-3 sm:p-4 space-y-2 sm:space-y-3 text-sm flex-1 overflow-y-auto'>
        <div className='bg-white/5 p-2.5 sm:p-3 rounded-lg flex items-center gap-2'>
          <span className='text-base sm:text-lg flex-shrink-0'>📧</span>
          <span className='truncate text-xs sm:text-sm'>
            {authUser?.email || 'No email'}
          </span>
        </div>

        {/* ✅ Removed location - not in schema */}

        <div className='bg-white/5 p-2.5 sm:p-3 rounded-lg flex items-center gap-2'>
          <span className='text-base sm:text-lg flex-shrink-0'>⚡</span>
          <span className='text-xs sm:text-sm'>Status: Active</span>
        </div>

        <div className='bg-white/5 p-2.5 sm:p-3 rounded-lg flex items-center gap-2'>
          <span className='text-base sm:text-lg flex-shrink-0'>💬</span>
          <span className='text-xs sm:text-sm'>Chats: 0 active</span>
        </div>

        {/* ✅ Member since - will work when backend returns createdAt */}
        {authUser?.createdAt && (
          <div className='bg-white/5 p-2.5 sm:p-3 rounded-lg flex items-center gap-2'>
            <span className='text-base sm:text-lg flex-shrink-0'>📅</span>
            <span className='text-xs sm:text-sm'>
              Joined: {new Date(authUser.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
