const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.aruba.it',
    port: 587,
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER, // e.g. info@vr-verity.com
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"VR VERITY" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
