import nodemailer from 'nodemailer';
const { MAIL_HOST, MAIL_PORT, MAIL_SENDER, MAIL_USER, MAIL_PASS, NODE_ENV } = process.env;

const transport = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export default (opts) => transport.sendMail({
  ...opts,
  from: MAIL_SENDER,
  ...NODE_ENV !== 'production' && { to: 'dev@example.com' },
  bcc: 'dev@example.com',
  subject: NODE_ENV === 'production' ? opts.subject : `[MAIL TEST] ${opts.subject}`
});
