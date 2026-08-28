import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: 'chat' | 'study_plan' | 'quiz' | 'concept' | 'note';
  content: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['chat', 'study_plan', 'quiz', 'concept', 'note'],
      default: 'chat',
    },
    content: { type: String, required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
