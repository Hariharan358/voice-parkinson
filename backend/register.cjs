const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');


// Setup Express App
const app = express();
const port = 5000;

// MongoDB Connection
mongoose.connect('mongodb+srv://231401032:kbxRUrZl96iO33uc@cluster0.kjcepnd.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, required: false }, // OTP field for verification
});

const User = mongoose.model('User', userSchema);

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'harikukh8@gmail.com', // Replace with your email
    pass: 'xbpd xfrn pmja vult', // Replace with your app-specific password
  },
});

// POST: Register User
app.post('/api/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validate user input
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new user with OTP
    const user = new User({ name, email, password: hashedPassword, otp });
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: 'harikuh8@gmail.com',
      to: email,
      subject: 'Verify Your Email',
      text: `Hello ${name},\n\nYour OTP for email verification is: ${otp}\n\nThank you for registering!`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
      }
      console.log('Email sent:', info.response);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. OTP sent to your email.',
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// POST: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Clear OTP after successful verification
    user.otp = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully! You can now log in.',
      redirect: '/login', // Redirect URL for client-side redirection
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});