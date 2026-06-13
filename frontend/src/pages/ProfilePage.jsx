import React, { useState, useEffect } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { authUser, updateProfile } = useAuth(); // ✅ Use updateProfile from context
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    status: 'Online',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Load user data when component mounts
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || '',
        bio: authUser.bio || '',
        status: authUser.status || 'Online',
      });
      setPreviewUrl(authUser.profilePic || assets.avatar_icon);
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('fullName', formData.fullName);
      updateData.append('bio', formData.bio);
      if (profilePic) {
        updateData.append('profilePic', profilePic);
      }

      // ✅ Use the updateProfile method from context
      const result = await updateProfile(updateData);

      if (result.success) {
        navigate('/');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-white'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold'>My Profile</h1>

          <button
            onClick={() => navigate('/')}
            className='px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition'
          >
            Back
          </button>
        </div>

        {/* Profile Picture */}
        <div className='flex flex-col items-center mb-8'>
          <div className='relative group'>
            <img
              src={previewUrl || assets.avatar_icon}
              alt='profile'
              className='w-32 h-32 rounded-full object-cover border-4 border-white/20'
            />

            <label className='absolute bottom-1 right-1 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition shadow-lg'>
              <span className='text-sm'>✎</span>
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='hidden'
              />
            </label>
          </div>

          <p className='mt-4 text-gray-300 text-sm'>
            Click the icon to update your photo
          </p>
          {profilePic && (
            <p className='mt-2 text-xs text-green-400'>New photo selected</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className='space-y-5'>
            {/* Full Name */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>
                Full Name
              </label>

              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 outline-none focus:border-blue-500 transition'
                placeholder='Enter your full name'
                required
              />
            </div>

            {/* Email - Read only */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Email</label>

              <input
                type='email'
                value={authUser?.email || ''}
                disabled
                className='w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Bio</label>

              <textarea
                name='bio'
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder='Tell something about yourself...'
                className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 resize-none outline-none focus:border-blue-500 transition'
                maxLength={150}
              />
              <p className='text-xs text-gray-400 mt-1 text-right'>
                {formData.bio.length}/150 characters
              </p>
            </div>

            {/* Status */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Status</label>

              <select
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 outline-none focus:border-blue-500 transition cursor-pointer'
              >
                <option className='text-black'>Online</option>
                <option className='text-black'>Away</option>
                <option className='text-black'>Busy</option>
                <option className='text-black'>Offline</option>
              </select>
            </div>

            {/* Member Since */}
            {authUser?.createdAt && (
              <div className='bg-white/5 p-3 rounded-lg'>
                <p className='text-xs text-gray-400'>
                  Member since:{' '}
                  {new Date(authUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className='flex justify-end gap-3 pt-4'>
              <button
                type='button'
                onClick={handleCancel}
                className='px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50'
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={loading}
                className='px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
