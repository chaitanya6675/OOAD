const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  // Register new customer
  static async register(req, res, next) {
    try {
      const { fullName, email, phone, password, confirmPassword } = req.body;

      // Validation
      if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
      }

      // Check existing email
      const existing = User.findByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Create User
      const user = await User.create({
        fullName,
        email,
        phone,
        password,
        role: 'customer'
      });

      // Initialize Customer Profile
      const customer = Customer.findByUserId(user.id);

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: customer.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const customer = Customer.findByUserId(user.id);

      res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: customer ? customer.toJSON() : user.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Get current user profile
  static async getMe(req, res, next) {
    try {
      const customer = Customer.findByUserId(req.user.id);
      res.json({
        success: true,
        user: customer ? customer.toJSON() : req.user.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Update profile & address
  static async updateProfile(req, res, next) {
    try {
      const { fullName, phone, address, city, state, postalCode, country } = req.body;

      if (!fullName) {
        return res.status(400).json({ success: false, message: 'Full name is required.' });
      }

      req.user.updateProfile({ fullName, phone });

      const customer = Customer.findByUserId(req.user.id);
      if (customer) {
        customer.updateAddress({ address, city, state, postalCode, country });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: customer ? customer.toJSON() : req.user.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
