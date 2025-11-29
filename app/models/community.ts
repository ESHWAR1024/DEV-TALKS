import mongoose, { Schema, models } from 'mongoose';

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: String,
      required: false, // Make optional for now
    },
    memberCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Community = models.Community || mongoose.model('Community', communitySchema);

export default Community;