import mongoose, { Schema, models } from "mongoose";

const ReplySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const VoteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  voteType: {
    type: String,
    enum: ['proceed', 'hold', 'discard'],
    required: true
  }
});

const IdeaSchema = new Schema({
  communityId: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['chat', 'proceed', 'hold', 'discard'],
    default: 'chat'
  },
  votes: [VoteSchema],
  replies: [ReplySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  movedAt: {
    type: Date,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  }
});

const Idea = models.Idea || mongoose.model("Idea", IdeaSchema);
export default Idea;