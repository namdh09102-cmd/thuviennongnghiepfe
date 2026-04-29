import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  // Extended profile fields
  username?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  expertise?: string[];
  main_crops?: string[];
  region?: string;
  role: 'user' | 'expert' | 'mod' | 'admin';
  isVerified?: boolean;
  is_verified?: boolean;
  points?: number;
  level?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  followers?: string[];   // array of user IDs
  following?: string[];   // array of user IDs
  created_at?: Date;
  updated_at?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  image: { type: String },
  username: { type: String, unique: true, sparse: true },
  bio: { type: String, maxlength: 200 },
  avatar: { type: String },
  location: { type: String },
  expertise: [{ type: String }],
  main_crops: [{ type: String }],
  region: { type: String },
  role: { type: String, enum: ['user', 'expert', 'mod', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  followers: [{ type: String }],
  following: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { strict: false }); // strict:false to allow NextAuth fields

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
