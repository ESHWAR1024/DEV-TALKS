import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  communities: [{
    type: Schema.Types.ObjectId,
    ref: 'Community',
    default: []
  }]
}, {
  timestamps: true
});

const User = models.User || mongoose.model("User", UserSchema);
export default User;