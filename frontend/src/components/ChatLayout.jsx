import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatContainer from './ChatContainer';
import RightSidebar from './RightSidebar';

const ChatLayout = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className='h-screen flex bg-black/20'>
      <Sidebar
        setSelectedUser={setSelectedUser}
        selectedUser={selectedUser} // ✅ Pass this down
      />
      <ChatContainer selectedUser={selectedUser} />
      <RightSidebar />
    </div>
  );
};

export default ChatLayout;
