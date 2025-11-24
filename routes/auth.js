import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

const generateToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    // Get all orders and populate product details
    const orders = await Order.find({}).populate('items.productId');

    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    // Get unique purchased products
    const purchasedProducts = [];
    const productIds = new Set();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId && !productIds.has(item.productId._id.toString())) {
          productIds.add(item.productId._id.toString());
          purchasedProducts.push({
            _id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image
          });
        }
      });
    });

    res.json({
      user: req.user,
      orderCount,
      totalSpent,
      purchasedProducts
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update profile information
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser.toJSON() });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Update profile picture
router.put('/profile-picture', authenticate, async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser.toJSON() });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Failed to update profile picture', error: error.message });
  }
});

export default router;
