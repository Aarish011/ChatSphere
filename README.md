# ChatSphere

A real-time chat application built with React and Express.js. Connect with others instantly through a seamless messaging experience.

## Features

- **Real-time Messaging**: Powered by Socket.io for instant message delivery
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **User Profiles**: Manage your profile and upload avatars
- **File Sharing**: Upload and share files through Cloudinary integration
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Cookie-based Sessions**: Secure session management

## Tech Stack

### Frontend
- React 19
- Vite (build tool)
- Tailwind CSS (styling)
- Socket.io Client (real-time communication)
- React Router (navigation)
- Axios (HTTP client)
- React Hot Toast & React Toastify (notifications)

### Backend
- Express.js (web framework)
- Node.js (runtime)
- MongoDB + Mongoose (database)
- JWT (authentication)
- bcrypt (password hashing)
- Socket.io (real-time events)
- Multer (file uploads)
- Cloudinary (cloud storage)
- CORS (cross-origin requests)

## Project Structure

```
chat-app/
├── frontend/                 # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express server
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   ├── package.json
│   └── .env                # Environment variables
│
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (local or cloud)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Setup** (`backend/.env`)
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   ```

2. **Frontend Setup** (`frontend/.env`)
   ```
   VITE_API_URL=http://localhost:5000
   ```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:5173`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start server with nodemon (auto-reload)
- `npm start` - Start server

## API Endpoints

The backend provides RESTful API endpoints for:
- User authentication (login, register, logout)
- User profile management
- Chat/message operations
- File uploads

Real-time events are handled through Socket.io connections.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

## Support

For help and support, please create an issue in the repository.
