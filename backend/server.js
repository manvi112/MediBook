import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/mongodb.js';
import getSessionConfig from './config/session.js';
import authRouter from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js'
import notFound from './middleware/notFound.js'
import doctorRouter from './routes/doctorRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(session(getSessionConfig()));

app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});