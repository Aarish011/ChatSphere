import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { selectedUser, setSelectedUser, onlineUsers, unreadCounts } =
    useChat();

  // ✅ FIX: useRef for debounce timer (no re-renders)
  const searchTimeoutRef = useRef(null);

  // Fetch search history on mount - ✅ with token check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null') {
      fetchSearchHistory();
    }
  }, []);

  // Fetch search history from backend
  const fetchSearchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axiosInstance.get('/api/user/search/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setRecentUsers(data.history);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  // Search users from backend
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      setShowRecent(true);
      return;
    }

    setLoading(true);
    setShowRecent(false);
    try {
      const token = localStorage.getItem('token');

      // ✅ FIX: encodeURIComponent to prevent URL breaking
      const { data } = await axiosInstance.get(
        `/api/user/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Search users error:', error);
      toast.error(error.response?.data?.message || 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Add user to search history
  const addToSearchHistory = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(
        `/api/user/search/add/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchSearchHistory(); // Refresh history
    } catch (error) {
      console.error('Add to history error:', error);
    }
  };

  // Clear search history
  const clearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete('/api/user/search/clear', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentUsers([]);
      toast.success('Search history cleared');
    } catch (error) {
      console.error('Clear history error:', error);
      toast.error('Failed to clear history');
    }
  };

  // Handle user click
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setSearch('');
    setUsers([]);
    setShowRecent(true);
    await addToSearchHistory(user._id);
  };

  // ✅ FIX: Debounced search with useRef (no re-renders)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleEditProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <div className='w-1/4 min-w-[260px] h-full bg-white/10 backdrop-blur-md border-r border-white/10 text-white flex flex-col'>
      {/* HEADER */}
      <div className='p-4 flex items-center justify-between border-b border-white/10 relative'>
        <h2 className='font-bold text-lg'>Chats</h2>
        <img
          src={assets.menu_icon}
          className='w-5 cursor-pointer'
          onClick={() => setMenuOpen(!menuOpen)}
          alt='menu'
        />
        {menuOpen && (
          <div className='absolute right-3 top-12 w-44 bg-white text-black rounded-lg shadow-lg overflow-hidden z-50'>
            <button
              onClick={handleEditProfile}
              className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm'
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500'
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* SEARCH */}
      <div className='p-3'>
        <div className='relative'>
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder='Search users...'
            className='w-full px-3 py-2 bg-white/10 rounded-lg outline-none text-sm'
          />
          {loading && (
            <div className='absolute right-3 top-2.5'>
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
            </div>
          )}
        </div>
      </div>

      {/* RECENT SEARCHES SECTION */}
      {showRecent && recentUsers.length > 0 && !search && (
        <div className='px-3 pb-2'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-xs text-gray-400'>Recent Searches</p>
            <button
              onClick={clearHistory}
              className='text-xs text-red-400 hover:text-red-300 transition'
            >
              Clear All
            </button>
          </div>
          <div className='space-y-1'>
            {recentUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const unreadCount = unreadCounts[user._id] || 0;

              return (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-white/10 rounded-lg transition
                    ${selectedUser?._id === user._id ? 'bg-white/10' : ''}
                  `}
                >
                  <div className='relative flex-shrink-0'>
                    <img
                      src={user.profilePic}
                      className='w-8 h-8 rounded-full object-cover'
                      alt={user.fullName}
                    />
                    {isOnline && (
                      <span className='absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-black rounded-full'></span>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {user.fullName}
                    </p>
                    <p className='text-xs text-gray-400'>Recent search</p>
                  </div>
                  {/* Unread Badge for Recent Searches */}
                  {unreadCount > 0 && (
                    <div className='flex-shrink-0'>
                      <span className='bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center'>
                        {unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH RESULTS */}
      <div className='flex-1 overflow-y-auto'>
        {!showRecent && users.length === 0 && !loading && search && (
          <div className='text-center text-gray-400 mt-6 text-sm'>
            No users found
          </div>
        )}

        {users.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const unreadCount = unreadCounts[user._id] || 0;

          return (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10 transition
                ${selectedUser?._id === user._id ? 'bg-white/10' : ''}
              `}
            >
              {/* AVATAR WITH ONLINE DOT */}
              <div className='relative flex-shrink-0'>
                <img
                  src={user.profilePic}
                  className='w-11 h-11 rounded-full object-cover'
                  alt={user.fullName}
                />
                {isOnline && (
                  <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full'></span>
                )}
              </div>

              {/* NAME */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{user.fullName}</p>
                <p className='text-xs text-gray-300'>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>

              {/* UNREAD COUNT BADGE */}
              {unreadCount > 0 && (
                <div className='flex-shrink-0'>
                  <span className='bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center'>
                    {unreadCount}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
