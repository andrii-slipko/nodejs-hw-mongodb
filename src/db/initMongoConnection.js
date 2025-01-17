import mongoose from 'mongoose';

export const initMongoConnection = async () => {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } = process.env;
  const connectionString = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    await mongoose.connect(connectionString);
    console.log('MongoDB connection successfully established!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};