import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-10 w-full max-w-md text-center shadow-2xl'>
        <h1 className='text-3xl sm:text-4xl font-bold text-white'>
          ChatSphere 💬
        </h1>

        <p className='text-gray-200 mt-3 text-sm sm:text-base'>
          A real-time chat application built with MERN + Socket.IO
        </p>

        <button
          onClick={() => navigate('/chat')}
          className='mt-6 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg'
        >
          Enter Chat
        </button>

        <p className='text-xs text-gray-300 mt-6'>
          Real-time messaging • Online status • Socket powered
        </p>
      </div>
    </div>
  );
};

export default HomePage;
