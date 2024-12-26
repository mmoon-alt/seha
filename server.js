import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import session from 'express-session';
import multer from 'multer';
import cors from 'cors';
import indexRouter from './routes/index.js';
import authRouter from './routes/authRoutes.js';
import apiRouter from './routes/apiRoutes.js';
import userRouter from './routes/userRoutes.js';

dotenv.config();

const app = express();

// إعدادات تسجيل الدخول
const loggerInstance = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ],
});

// إعداد CORS
app.use(cors({
    origin: ['https://seha.work'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعداد الجلسات
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(logger('dev'));
app.use(helmet());

// إعداد معدل الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 30 // الحد الأقصى 30 طلبًا
});
app.use(limiter);

// إعداد Multer للتعامل مع الملفات المرفوعة
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // تم تصحيح الخطأ هنا
    }
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => loggerInstance.info('Connected to MongoDB'))
    .catch((err) => loggerInstance.error('Error connecting to MongoDB:', err));

// تعريف المسارات
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/users', userRouter);

// نقطة الاتصال لاستقبال إشعارات حالة التسليم من Twilio
app.post('/status-callback', (req, res) => {
    const messageSid = req.body.MessageSid;
    const status = req.body.MessageStatus;
    loggerInstance.info(`Message SID: ${messageSid}, Status: ${status}`);
    res.status(200).send('OK');
});

// خطأ معالجة middleware
app.use((err, req, res, next) => {
    loggerInstance.error(err.stack);
    res.status(500).json({ error: 'حدث خطأ في الخادم', message: err.message });
});

// بدء الخادم
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    loggerInstance.info(`Server is running on port ${PORT}`);
});
