import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/medibook`);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error after initial connection:', err.message);
  });
}


export default connectDB
