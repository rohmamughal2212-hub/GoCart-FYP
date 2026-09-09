import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const url = 'http://127.0.0.1:5000/api/user/send-otp';
const body = { name: 'Test User', email: 'testuser+gocart@example.com', password: 'Test1234' };

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(async () => ({ raw: await res.text() }));
  console.log('STATUS', res.status);
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error('ERR', err.message);
  if (err.stack) console.error(err.stack);
}
