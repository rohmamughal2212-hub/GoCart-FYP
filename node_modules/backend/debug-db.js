import { connectDB, dbAvailable } from './config/connectDB.js';
import { findUser } from './controller/user.controller.js';

console.log('before connect dbAvailable', dbAvailable);
await connectDB();
console.log('after connect dbAvailable', dbAvailable);
try {
  const user = await findUser({ email: 'testuser+gocart@example.com' });
  console.log('findUser returned', user);
} catch (err) {
  console.error('findUser error', err.message);
}
