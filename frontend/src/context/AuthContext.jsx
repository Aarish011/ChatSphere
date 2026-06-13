import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axiosInstance from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  // Persist auth state on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token && token !== 'null') {
      setAuthUser(JSON.parse(storedUser));
    }
  }, []);

  const signup = async (formData) => {
    const { data } = await axiosInstance.post('/api/user/register', formData);

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthUser(data.user);
      toast.success('Register Successfully');
      navigate('/');
    }

    return data;
  };

  const login = async (formData) => {
    const { data } = await axiosInstance.post('/api/user/login', formData);

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthUser(data.user);
      toast.success('Login Successfully');
      navigate('/');
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
    toast.success('Logout Successfully');
    navigate('/login');
  };

  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem('token');

      const { data } = await axiosInstance.post('/api/user/update', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setAuthUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Profile updated successfully');
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
      throw error;
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token || token === 'null') return;

      const { data } = await axiosInstance.get('/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAuthUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.log(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        signup,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
