import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  address: {
    type: String
  },
  profilePicture: String,
  provider: {
    type: String,
    required: true,
    enum: ['google', 'github', 'metamask', 'email']
  },
  providerId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});


export default mongoose.model('User', userSchema);