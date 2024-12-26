# استخدم صورة Node.js الرسمية كنقطة بداية
FROM node:18

# تعيين مجلد العمل في الحاوية
WORKDIR /app

# نسخ package.json و package-lock.json إلى مجلد العمل
COPY package*.json ./

# تثبيت التبعيات
RUN npm install

# نسخ جميع الملفات إلى مجلد العمل
COPY . .

# تعيين المنفذ الذي ستستمع عليه الحاوية
EXPOSE 4000

# الأوامر الافتراضية لتشغيل التطبيق
CMD ["npm", "start"]