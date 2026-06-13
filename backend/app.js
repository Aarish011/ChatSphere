import express from 'express';
import cors from 'cors';
import './config/env.js';
import dbconnect from './config/dbConnect.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();
dbconnect();
//buit in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.get('/', (req, res) => {
  res.send('Backend Running');
});

app.use('/api/user/', userRouter);
app.use('/api/message', messageRouter);

export default app;
