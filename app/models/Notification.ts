import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['reply', 'vote', 'idea_moved', 'new_idea'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  ideaId: {
    type: Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  },
  ideaTitle: {
    type: String,
    required: true
  },
  communityId: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  communityName: {
    type: String,
    required: true
  },
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fromUserName: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;