import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ChatLayout from './components/ChatLayout';
import { Toaster } from 'react-hot-toast';
import bgImage from './assets/bgImage.svg';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { authUser } = useAuth();
  const token = localStorage.getItem('token');

  return (
    <div
      className='bg-cover bg-center min-h-screen'
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Toaster position='top-right' />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<HomePage />} />
        <Route
          path='/login'
          element={
            !authUser && !token ? <LoginPage /> : <Navigate to='/chat' />
          }
        />

        {/* Protected Routes - Require Authentication */}
        <Route
          path='/profile'
          element={
            authUser || token ? <ProfilePage /> : <Navigate to='/login' />
          }
        />

        <Route
          path='/chat'
          element={
            authUser || token ? <ChatLayout /> : <Navigate to='/login' />
          }
        />

        {/* Catch all - redirect to home */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </div>
  );
};

export default App;
