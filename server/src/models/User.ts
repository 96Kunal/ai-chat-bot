import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  major?: string;
  year?: string;
  avatar?: string;
  customApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    major: { type: String, default: 'Computer Science & Engineering' },
    year: { type: String, default: '3rd Year' },
    avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=student' },
    customApiKey: { type: String, default: '' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
