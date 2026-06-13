import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { authUser } = useAuth();

  // ✅ FIX: Use ref to avoid stale selectedUser in socket listeners
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ✅ FIX: Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axiosInstance.get('/api/user/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUnreadCounts(data.unreadCounts);
      }
    } catch (error) {
      console.error('Fetch unread counts error:', error);
    }
  };

  // Connect to Socket.IO when user is authenticated
  useEffect(() => {
    if (!authUser) return;

    const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
      query: {
        userId: authUser._id,
      },
      transports: ['websocket'],
      reconnection: true,
    });

    setSocket(socketInstance);
    fetchUnreadCounts();

    return () => {
      socketInstance.disconnect();
    };
  }, [authUser]);

  // Listen for online users
  useEffect(() => {
    if (!socket) return;

    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('getOnlineUsers');
    };
  }, [socket]);

  // ✅ FIX: Listen for real-time messages with ref for selectedUser
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // ✅ FIX: Get senderId properly (handle populated vs string)
      const senderId = newMessage.senderId?._id || newMessage.senderId;

      // Update messages if chat is open with sender
      if (selectedUserRef.current && senderId === selectedUserRef.current._id) {
        setMessages((prev) => [...prev, newMessage]);
        // Clear unread count for this user
        setUnreadCounts((prev) => ({ ...prev, [senderId]: 0 }));
      } else {
        // Increment unread count for the sender
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
        const senderName = newMessage.senderId?.fullName || 'Someone';
        toast.success(`New message from ${senderName}`);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket]);

  // Listen for message delivered status
  useEffect(() => {
    if (!socket) return;

    const handleMessageDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg
        )
      );
    };

    socket.on('messageDelivered', handleMessageDelivered);

    return () => {
      socket.off('messageDelivered', handleMessageDelivered);
    };
  }, [socket]);

  // Listen for messages seen status
  useEffect(() => {
    if (!socket || !authUser) return;

    const handleMessagesSeen = ({ by, senderId }) => {
      if (authUser._id === senderId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.receiverId === by && !msg.seen) {
              return { ...msg, seen: true };
            }
            return msg;
          })
        );
      }
    };

    socket.on('messagesSeen', handleMessagesSeen);

    return () => {
      socket.off('messagesSeen', handleMessagesSeen);
    };
  }, [socket, authUser]);

  // Listen for unread count updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdateUnreadCount = ({ userId }) => {
      if (userId === authUser?._id) {
        fetchUnreadCounts();
      }
    };

    socket.on('updateUnreadCount', handleUpdateUnreadCount);

    return () => {
      socket.off('updateUnreadCount', handleUpdateUnreadCount);
    };
  }, [socket, authUser]);

  // ✅ FIX: Listen for typing indicator with proper payload handling
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ senderId }) => {
      if (selectedUserRef.current && senderId === selectedUserRef.current._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (selectedUserRef.current && senderId === selectedUserRef.current._id) {
        setIsTyping(false);
      }
    };

    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket]);

  // Mark messages as seen when chat opens
  useEffect(() => {
    if (selectedUser && socket && authUser) {
      socket.emit('markSeen', {
        senderId: selectedUser._id,
        receiverId: authUser._id,
      });

      const markAsSeenAPI = async () => {
        try {
          const token = localStorage.getItem('token');
          await axiosInstance.put(
            `/api/message/mark/${selectedUser._id}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Clear unread count for this user
          setUnreadCounts((prev) => ({ ...prev, [selectedUser._id]: 0 }));
        } catch (error) {
          console.error('Mark as seen API error:', error);
        }
      };

      markAsSeenAPI();
    }
  }, [selectedUser, socket, authUser]);

  // Get messages between current user and selected user
  const getMessages = async (userId) => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const { data } = await axiosInstance.get(`/api/message/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        // ✅ FIX: Ensure messages have consistent structure
        const formattedMessages = data.messages.map((msg) => ({
          ...msg,
          senderId: msg.senderId?._id || msg.senderId,
          receiverId: msg.receiverId?._id || msg.receiverId,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Get messages error:', error);
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message (with optional image file)
  const sendMessage = async (receiverId, text, imageFile = null) => {
    if (!receiverId) return;
    if ((!text || !text.trim()) && !imageFile) return;

    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();

      if (text) {
        formData.append('text', text);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await axiosInstance.post(
        `/api/message/send/${receiverId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        return data;
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      throw error;
    }
  };

  // ✅ FIX: Handle typing event with senderId included
  const handleTyping = (receiverId) => {
    if (!socket || !authUser) return;

    socket.emit('typing', {
      receiverId,
      senderId: authUser._id,
    });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit('stopTyping', {
        receiverId,
        senderId: authUser._id,
      });
    }, 1000);

    setTypingTimeout(timeout);
  };

  const value = {
    selectedUser,
    setSelectedUser,
    messages,
    setMessages,
    loading,
    setLoading,
    getMessages,
    sendMessage,
    socket,
    onlineUsers,
    isTyping,
    handleTyping,
    unreadCounts,
    fetchUnreadCounts,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
