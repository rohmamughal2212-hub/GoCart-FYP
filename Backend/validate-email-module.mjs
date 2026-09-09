import('./config/email.js')
  .then(() => console.log('email module OK'))
  .catch((err) => { console.error(err); process.exit(1); });
