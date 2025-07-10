import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
