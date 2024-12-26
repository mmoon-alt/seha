import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  idNumber: {
    type: String,
    required: true,
    unique: true
  },
  servicecode: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});

const User = mongoose.model('User', userSchema);

export default User;