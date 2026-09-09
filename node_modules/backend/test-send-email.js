import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const { sendEmail } = await import('./config/email.js');

const run = async () => {
  try {
    const result = await sendEmail({
      to: 'testuser+gocart@example.com',
      subject: 'Grocery App Mailer Test',
      html: '<p>This is a test email.</p>',
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Mailer test failed:', err);
    process.exit(1);
  }
};

run();
