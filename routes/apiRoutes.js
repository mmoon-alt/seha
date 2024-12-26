import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import sendSMS from '../utils/sendSMS.js'; // استيراد sendSMS

const router = express.Router();

// تعريف دالة توليد رمز الخدمة
function generateServiceCode() {
  const prefix = Math.random() < 0.5 ? 'GSL' : 'PSL';
  const randomNumbers = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${prefix}${randomNumbers}`;
}

// تعريف الحد من عدد الاستعلامات لكل مستخدم
const queryLimit = rateLimit({
  windowMs: 10 * 24 * 60 * 60 * 1000,
  max: 30,
  message: 'لقد وصلت إلى الحد الأقصى للاستعلامات المسموح بها. يرجى الانتظار حتى انتهاء الفترة الزمنية.'
});

// إضافة إجازة (مشرفين فقط)
router.post('/leaves', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    console.log('Received request to add leave');
    const { idNumber, name, servicecode, startDate, endDate, phoneNumber, sendSMS } = req.body;
    console.log('Request Body:', req.body);

    if (!idNumber || !name || !servicecode || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required fields: idNumber, name, servicecode, or phoneNumber' });
    }

    console.log('Checking if user exists');
    let user = await User.findOne({ idNumber });
    if (!user) {
      console.log('User not found, creating a new user');
      user = new User({ idNumber, servicecode, isAdmin: false });
      await user.save();
    }

    console.log('Calculating leave duration');
    const leaveDuration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const expirationDays = leaveDuration === 1 ? 3 : leaveDuration === 2 ? 5 : leaveDuration + 3;

    console.log('Creating leave object');
    const leave = new Leave({
      ...req.body,
      userId: user._id,
      expirationDate: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
    });

    console.log('Saving leave');
    const savedLeave = await leave.save();
    console.log('Saved leave:', savedLeave);

    if (sendSMS) {
      const smsMessage = `خطاك السوء، ${leave.name.split(' ')[0]} تم إصدار إجازة مرضية ل برقم ${leave.serviceCode} لمدة ${leave.leaveDuration} يوما. ويمكنك الإطلاع عليها عبر تطبيق صحتي، دمتم بصحة.`;
      await sendSMS(phoneNumber, smsMessage);
    }

    res.status(201).json({ ...savedLeave._doc });
  } catch (error) {
    console.error('Error while adding leave:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'خطأ: يوجد إدخال مكرر في الحقول الفريدة.' });
    } else {
      res.status(500).json({ message: 'حدث خطأ أثناء إضافة الإجازة' });
    }
  }
});

// استرجاع إجازات المستخدم حسب idNumber
router.get('/user-leaves', authenticateToken, async (req, res) => {
  try {
    const { idNumber } = req.query;
    if (!idNumber) {
      return res.status(400).json({ message: 'رقم الهوية مطلوب' });
    }
    const leaves = await Leave.find({ idNumber });
    console.log('Fetched leaves:', leaves);
    res.json(leaves);
  } catch (error) {
    console.error('Error while retrieving user leaves:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// تحديث إجازة (مشرفين فقط)
router.put('/leaves/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    if (!req.params.id || !req.body) {
      return res.status(400).json({ message: 'Missing required fields: id or body' });
    }
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(leave);
  } catch (error) {
    console.error('Error while updating leave:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الإجازة' });
  }
});

// حذف إجازة (مشرفين فقط)
router.delete('/leaves/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'Missing id' });
    }
    await Leave.findByIdAndRemove(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error while deleting leave:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف الإجازة' });
  }
});

export default router;