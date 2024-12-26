import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
    idNumber: { type: String, required: true },
    servicecode: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    issueDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    leaveDuration: { type: Number, required: true },
    doctorName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    phoneNumber: { type: String, required: true }, // إضافة حقل رقم الهاتف
    expirationDate: { type: Date, required: true }
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
