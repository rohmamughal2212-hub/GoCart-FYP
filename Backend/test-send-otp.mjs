const url = 'http://127.0.0.1:5000/api/user/send-otp';
const payload = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'secret123',
};

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('status', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('request error', err);
  }
})();
