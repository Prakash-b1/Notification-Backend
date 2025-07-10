import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['manager', 'user'], default: 'user' },
  online: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);