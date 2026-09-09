import mongoose from 'mongoose';
import { connectDB, dbAvailable } from './config/connectDB.js';
import User from './models/user.model.js';

console.log('before connect dbAvailable', dbAvailable);
console.log('before connect readyState', mongoose.connection.readyState);
await connectDB();
console.log('after connect dbAvailable', dbAvailable);
console.log('after connect readyState', mongoose.connection.readyState);
console.log('mongoose.host', mongoose.connection.host);
console.log('mongoose.port', mongoose.connection.port);
console.log('mongoose.name', mongoose.connection.name);
console.log('mongoose.readyState', mongoose.connection.readyState);
console.log('isMongoReady', dbAvailable && mongoose.connection.readyState === 1);
try {
  const u = await User.findOne({ email: 'testuser+gocart@example.com' });
  console.log('User.findOne returned', u);
} catch (err) {
  console.error('User.findOne error', err);
}
