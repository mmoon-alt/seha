import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; // استخدام Messaging Service SID
const phoneNumber = process.env.TWILIO_PHONE_NUMBER; // استخدام رقم الهاتف كاحتياطي
const client = twilio(accountSid, authToken);

const sendSMS = (to, message) => {
    return client.messages.create({
        body: message,
        from: messagingServiceSid || phoneNumber, // تفضيل اسم المرسل مع استخدام رقم الهاتف كاحتياطي
        to
    });
};

export default sendSMS;