import React from 'react';
import assets from '../assets/assets';
import { useAuth } from '../context/AuthContext';

const RightSidebar = () => {
  const { authUser } = useAuth();

  return (
    <div className='w-1/4 min-w-[260px] h-full bg-white/10 backdrop-blur-md border-l border-white/10 text-white flex flex-col'>
      {/* Profile */}
      <div className='p-5 flex flex-col items-center border-b border-white/10'>
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          alt='profile'
          className='w-20 h-20 rounded-full object-cover ring-2 ring-white/20'
        />

        <h2 className='mt-3 font-bold'>{authUser?.fullName || 'User'}</h2>

        <p className='text-xs text-gray-300'>
          {authUser?.bio || 'No bio added'}
        </p>
      </div>

      {/* Info */}
      <div className='p-4 space-y-3 text-sm'>
        <div className='bg-white/5 p-3 rounded-lg flex items-center gap-2'>
          <span className='text-lg'>📧</span>
          <span className='truncate'>{authUser?.email || 'No email'}</span>
        </div>

        {/* ✅ Removed location - not in schema */}

        <div className='bg-white/5 p-3 rounded-lg flex items-center gap-2'>
          <span className='text-lg'>⚡</span>
          <span>Status: Active</span>
        </div>

        <div className='bg-white/5 p-3 rounded-lg flex items-center gap-2'>
          <span className='text-lg'>💬</span>
          <span>Chats: 0 active</span>
        </div>

        {/* ✅ Member since - will work when backend returns createdAt */}
        {authUser?.createdAt && (
          <div className='bg-white/5 p-3 rounded-lg flex items-center gap-2'>
            <span className='text-lg'>📅</span>
            <span>
              Joined: {new Date(authUser.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
