import mongoose, { Schema, model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/pinterest-users')

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '../public/assets/41-410093_circled-user-icon-user-profile-icon-png.png',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ]
});

userSchema.plugin(passportLocalMongoose)
export default model('User', userSchema);
