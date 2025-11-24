import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (for seeding initial data)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Seed initial products
router.post('/seed', async (req, res) => {
  try {
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.json({ message: 'Products already seeded' });
    }

    const products = [
      {
        name: "Minimalist Watch",
        price: 299,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
        description: "Elegant timepiece with a clean, minimal design. Perfect for everyday wear.",
        category: "Accessories"
      },
      {
        name: "Wireless Headphones",
        price: 199,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        description: "Premium sound quality with noise cancellation. Sleek and comfortable design.",
        category: "Electronics"
      },
      {
        name: "Modern Backpack",
        price: 129,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
        description: "Stylish and functional backpack for the modern professional.",
        category: "Fashion"
      },
      {
        name: "Desk Lamp",
        price: 89,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop",
        description: "Contemporary design with adjustable brightness and warm light.",
        category: "Home"
      },
      {
        name: "Water Bottle",
        price: 39,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
        description: "Eco-friendly stainless steel bottle with elegant matte finish.",
        category: "Lifestyle"
      },
      {
        name: "Sunglasses",
        price: 149,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop",
        description: "Classic aviator style with UV protection and lightweight frame.",
        category: "Accessories"
      },
      {
        name: "Laptop Stand",
        price: 79,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        description: "Ergonomic aluminum stand that elevates your workspace.",
        category: "Home"
      },
      {
        name: "Smart Speaker",
        price: 249,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
        description: "High-fidelity audio with voice assistant integration.",
        category: "Electronics"
      }
    ];

    const createdProducts = await Product.insertMany(products);
    res.status(201).json({ message: 'Products seeded successfully', products: createdProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

