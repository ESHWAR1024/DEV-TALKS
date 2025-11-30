import mongoose, { Schema, models } from "mongoose";

const CommunitySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Changed to false for backward compatibility
  },
  creatorName: {
    type: String,
    required: false, // Changed to false for backward compatibility
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  memberCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

const Community = models.Community || mongoose.model("Community", CommunitySchema);
export default Community;