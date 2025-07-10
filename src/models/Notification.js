import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete normal notifications after 2 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2 * 24 * 60 * 60, partialFilterExpression: { priority: 'normal' } }
);

export default mongoose.model('Notification', notificationSchema);
