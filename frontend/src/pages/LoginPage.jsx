import React, { useState } from 'react';
import assets from '../assets/assets';
import { useAuth } from '../context/AuthContext';



const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePic, setProfilePic] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      console.log("Passwords don't match");
      return;
    }

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });

      } else {
        // Create form data for file upload
        const signupData = new FormData();
        signupData.append('fullName', formData.fullName);
        signupData.append('email', formData.email);
        signupData.append('password', formData.password);
        if (profilePic) {
          signupData.append('profilePic', profilePic);
        }

        await signup(signupData);
      }
    } catch (error) {
     
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById('avatarPreview').src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8'>
        {/* Logo */}
        <div className='flex flex-col items-center'>
          <img
            src={assets.logo}
            alt='logo'
            className='w-20 mb-4 text-white bg-black'
          />

          <h1 className='text-3xl font-bold text-white'>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>

          <p className='text-gray-300 text-sm mt-2'>
            {isLogin
              ? 'Sign in to continue chatting'
              : 'Join and start chatting with friends'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
          {/* Full Name - Only for Signup */}
          {!isLogin && (
            <div>
              <label className='text-sm text-gray-300 block mb-2'>
                Full Name
              </label>

              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder='Enter your full name'
                className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none placeholder-gray-400 focus:border-blue-500'
                required={!isLogin}
              />
            </div>
          )}

          {/* Profile Picture Upload - Only for Signup */}
          {!isLogin && (
            <div className='flex flex-col items-center gap-2 py-2'>
              <img
                id='avatarPreview'
                src={assets.avatar_icon}
                className='w-20 h-20 rounded-full border-2 border-white/20 object-cover'
                alt='avatar'
              />

              <label className='text-sm text-blue-400 cursor-pointer hover:text-blue-300 transition'>
                Upload Profile Picture
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='hidden'
                />
              </label>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className='text-sm text-gray-300 block mb-2'>Email</label>

            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              placeholder='Enter your email'
              className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none placeholder-gray-400 focus:border-blue-500'
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className='text-sm text-gray-300 block mb-2'>Password</label>

            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              placeholder='Enter your password'
              className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none placeholder-gray-400 focus:border-blue-500'
              required
            />
          </div>

          {/* Confirm Password - Only for Signup */}
          {!isLogin && (
            <div>
              <label className='text-sm text-gray-300 block mb-2'>
                Confirm Password
              </label>

              <input
                type='password'
                name='confirmPassword'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder='Confirm your password'
                className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none placeholder-gray-400 focus:border-blue-500'
                required={!isLogin}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            className='w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium text-white'
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className='flex items-center gap-3 my-6'>
          <div className='flex-1 h-px bg-white/20'></div>
          <span className='text-gray-400 text-sm'>OR</span>
          <div className='flex-1 h-px bg-white/20'></div>
        </div>

        {/* Google Button */}
        <button className='w-full py-3 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition'>
          Continue with Google
        </button>

        {/* Footer Toggle */}
        <p className='text-center text-gray-300 text-sm mt-6'>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}

          <button
            type='button'
            onClick={() => setIsLogin(!isLogin)}
            className='text-blue-400 ml-1 hover:underline'
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
