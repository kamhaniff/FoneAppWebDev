// Import modules
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const gmailUser = process.env.GMAIL_USER || require('config').get('GMAIL_USER');
const gmailPass = process.env.GMAIL_PASS || require('config').get('GMAIL_PASS');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Use middleware
app.use(cors({ origin: 'https://www.foneapp.asia' })); // Replace with your domain
app.use(bodyParser.json()); // Parse JSON data from requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

app.use(express.static(path.resolve(__dirname, 'build')));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

// Define a route to handle form submissions
app.post('/send', (req, res) => {
  const { formType, ...formData } = req.body;

  let subject, text;

  if (formType === 'contact') {
    subject = 'FoneApp Inquiries'; // Update the subject if needed
    text = `
      Name: ${formData.name}
      Company: ${formData.company}
      Phone: ${formData.phone}
      Email: ${formData.email}
      Subject: ${formData.subject}
      Message: ${formData.message}
    `;
  } else if (formType === 'benefit') {
    subject = 'Merchant Inquiries'; // Update the subject if needed
    text = `
      Contact Name: ${formData.contactName}
      Contact Number: ${formData.contactNumber}
      Email: ${formData.email}
      Company/Brand Name: ${formData.companyName}
      Business Industry: ${formData.businessIndustry}
      Where did you find us: ${formData.findUs}
      Question: ${formData.question}
    `;
  } else {
    return res.status(400).send('Invalid form type');
  }

  const mailOptions = {
    from: formData.email, // The sender's email address
    to: 'support@forestone.com.my', // Recipient email
    subject: subject,
    text: text,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error: ' + error.message);
    }
    res.status(200).send('Email sent successfully!');
  });
});

// Catch-all route to serve React's index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
