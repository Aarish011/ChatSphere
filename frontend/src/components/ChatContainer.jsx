import React, { useState, useEffect, useRef } from 'react';
import assets from '../assets/assets';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Helper function to format time
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatContainer = () => {
  const {
    selectedUser,
    messages,
    getMessages,
    sendMessage,
    loading,
    isTyping,
    handleTyping,
    onlineUsers,
  } = useChat();
  const { authUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!newMessage.trim() && !selectedImageFile) {
      toast.error('Please enter a message or select an image');
      return;
    }

    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }

    setSending(true);
    try {
      await sendMessage(selectedUser._id, newMessage, selectedImageFile);
      setNewMessage('');
      clearSelectedImage();
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper function to check if message is from current user
  const isMessageFromMe = (message) => {
    const senderId = message.senderId?._id || message.senderId;
    return senderId?.toString() === authUser?._id?.toString();
  };

  // Check if selected user is online
  const isSelectedUserOnline = onlineUsers.includes(selectedUser?._id);

  // Show placeholder when no user selected
  if (!selectedUser) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center h-full text-white bg-black/5 p-4'>
        <img
          src={assets.logo_big || assets.logo}
          className='w-32 sm:w-40 opacity-60'
          alt='placeholder'
        />
        <p className='text-gray-400 mt-4 text-sm sm:text-base text-center'>
          Select a user to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col flex-1 h-full text-white'>
      {/* Header - Mobile Optimized */}
      <div className='p-3 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <img
            src={selectedUser.profilePic}
            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0'
            alt={selectedUser.fullName || selectedUser.name}
          />
          <div className='min-w-0 flex-1'>
            <p className='font-medium text-sm sm:text-base truncate'>
              {selectedUser.fullName || selectedUser.name}
            </p>
            <p
              className={`text-[10px] sm:text-xs ${isSelectedUserOnline ? 'text-green-400' : 'text-gray-400'}`}
            >
              {isSelectedUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <img
          src={assets.help_icon}
          alt='help'
          className='w-5 h-5 sm:w-7 sm:h-7 cursor-pointer opacity-70 hover:opacity-100 transition flex-shrink-0'
        />
      </div>

      {/* Messages Area - Mobile Optimized */}
      <div className='flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4'>
        {loading ? (
          <div className='flex justify-center items-center h-full'>
            <div className='w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-gray-400'>
            <p className='text-sm sm:text-base'>No messages yet</p>
            <p className='text-xs sm:text-sm mt-2 text-center px-4'>
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = isMessageFromMe(message);
            return (
              <div
                key={message._id}
                className={`flex items-end gap-1 sm:gap-2 ${
                  isMine ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isMine && (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.fullName || selectedUser.name}
                    className='w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0'
                  />
                )}

                <div
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 max-w-[75%] sm:max-w-[60%] ${
                    isMine
                      ? 'bg-blue-500/90 backdrop-blur-sm shadow-lg rounded-2xl rounded-br-md'
                      : 'bg-white/10 backdrop-blur-sm shadow-lg rounded-2xl rounded-bl-md'
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt='message'
                      className='max-w-[150px] sm:max-w-[200px] max-h-[150px] sm:max-h-[200px] rounded-lg mb-1.5 sm:mb-2 cursor-pointer'
                      onClick={() => window.open(message.image, '_blank')}
                    />
                  )}
                  {message.text && (
                    <p className='text-sm sm:text-base break-words'>
                      {message.text}
                    </p>
                  )}

                  <div
                    className={`text-[8px] sm:text-[10px] mt-1 text-right flex items-center justify-end gap-0.5 sm:gap-1 ${
                      isMine ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    <span>{formatTime(message.createdAt)}</span>
                    {isMine && (
                      <span>
                        {message.seen ? (
                          <span className='text-blue-400 text-[8px] sm:text-[10px] font-medium'>
                            ✓✓
                          </span>
                        ) : message.delivered ? (
                          <span className='text-gray-400 text-[8px] sm:text-[10px]'>
                            ✓✓
                          </span>
                        ) : (
                          <span className='text-gray-400 text-[8px] sm:text-[10px]'>
                            ✓
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {isMine && (
                  <img
                    src={authUser?.profilePic || assets.avatar_icon}
                    alt='You'
                    className='w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0'
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview - Mobile Optimized */}
      {imagePreview && (
        <div className='px-3 py-2 border-t border-white/10'>
          <div className='relative inline-block'>
            <img
              src={imagePreview}
              alt='preview'
              className='w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover'
            />
            <button
              onClick={clearSelectedImage}
              className='absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs hover:bg-red-600'
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Typing Indicator - Mobile Optimized */}
      {isTyping && selectedUser && (
        <div className='px-3 sm:px-4 py-1.5 sm:py-2'>
          <p className='text-[10px] sm:text-xs text-gray-300 italic'>
            {selectedUser.fullName} is typing...
          </p>
        </div>
      )}

      {/* Input Area - Mobile Optimized */}
      <div className='p-2 sm:p-3 border-t border-white/10 flex items-center gap-1.5 sm:gap-2'>
        <label className='p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition cursor-pointer flex-shrink-0'>
          <img src={assets.gallery_icon} alt='gallery' className='w-4 sm:w-5' />
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleImageSelect}
          />
        </label>

        <input
          type='text'
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            if (selectedUser) {
              handleTyping(selectedUser._id);
            }
          }}
          onKeyDown={handleKeyDown}
          className='flex-1 bg-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg outline-none text-sm sm:text-base min-w-0'
          placeholder='Type a message...'
          disabled={sending}
        />

        <button
          onClick={handleSend}
          disabled={sending || (!newMessage.trim() && !selectedImageFile)}
          className='bg-blue-500 p-1.5 sm:p-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0'
        >
          {sending ? (
            <div className='w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
          ) : (
            <img src={assets.send_button} className='w-4 sm:w-5' alt='send' />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
