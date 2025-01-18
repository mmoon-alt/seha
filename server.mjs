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
import cookieParser from 'cookie-parser'; // استيراد cookie-parser
import indexRouter from './routes/index.js';
import authRouter from './routes/authRoutes.js';
import apiRouter from './routes/apiRoutes.js';
import userRouter from './routes/userRoutes.js';

// استيراد المكتبات المطلوبة للصفحة الجانبية
import puppeteer from 'puppeteer';
import jsPDF from 'jspdf';
import pdfkit from 'pdfkit';
import path from 'path';
import fs from 'fs';

// إضافة هذه الأسطر لتعريف __dirname في ES module
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// تفعيل خاصية trust proxy
app.set('trust proxy', 1);

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
    origin: ['https://seha.work', 'http://localhost:3000'], // التأكد من إضافة كلا الأصلين
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعداد الكوكيز
app.use(cookieParser()); // استخدام cookie-parser

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
        cb(null, `${Date.now()}-${file.originalname}`);
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

// إعداد مسار الصفحة الجانبية لتحويل إلى PDF
app.use(express.static(path.join(__dirname, 'client/public')));

app.get('/convert', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        const errorMessage = 'يرجى تقديم URL صحيح.';
        loggerInstance.error(errorMessage, { route: '/convert', url });
        return res.status(400).send(errorMessage);
    }

    let pdfBuffer;

    const methods = [
        async () => {
            // استخدام Puppeteer
            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            const buffer = await page.pdf({ format: 'A4' });
            await browser.close();
            return buffer;
        },
        async () => {
            // استخدام jsPDF
            const doc = new jsPDF();
            doc.text("Example content", 10, 10);
            return doc.output();
        },
        async () => {
            // استخدام pdfkit
            const doc = new pdfkit();
            doc.text('Example content');
            let chunks = [];
            return new Promise((resolve, reject) => {
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.end();
            });
        }
    ];

    for (const method of methods) {
        try {
            pdfBuffer = await method();
            if (pdfBuffer) break;
        } catch (error) {
            loggerInstance.error(`Error in method ${method.name}`, { error: error.message, stack: error.stack });
        }
    }

    if (pdfBuffer) {
        res.type('application/pdf');
        res.send(pdfBuffer);
    } else {
        const errorMessage = 'All PDF generation methods failed.';
        loggerInstance.error(errorMessage, { url });
        res.status(500).send('حدث خطأ أثناء تحويل الصفحة إلى PDF.');
    }
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
    console.log(`Server is running on port ${PORT}`);
});