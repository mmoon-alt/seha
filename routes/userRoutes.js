import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// التحقق من وجود المستخدم بناءً على رقم الهوية
router.get('/User/:idNumber', async (req, res) => {
  try {
    const user = await User.findOne({ idNumber: req.params.idNumber });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// إضافة مستخدم جديد
router.post('/User', async (req, res) => {
  const { idNumber, servicecode, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ idNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({ idNumber, servicecode, isAdmin });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

export default router;

