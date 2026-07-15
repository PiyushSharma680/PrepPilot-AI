import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('\x1b[31m[ERROR] MongoDB is not configured. Please configure MONGODB_URI in your .env file.\x1b[0m');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('\x1b[31m[ERROR] Failed to connect to MongoDB:\x1b[0m', error.message);
    process.exit(1);
  }
};
