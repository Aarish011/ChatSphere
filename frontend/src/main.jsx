import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx'; // ✅ Fixed: ChatProvider (not ChatConext)

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        {' '}
        {/* ✅ Fixed: ChatProvider (not ChatConext) */}
        <App />
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
);
