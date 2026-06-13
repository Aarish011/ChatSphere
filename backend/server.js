import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app.js';
import { initSocket } from './lib/socket.js';

const PORT = process.env.PORT || 3000;

const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
