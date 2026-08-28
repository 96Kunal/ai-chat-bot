import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category: 'Urgent' | 'Academic' | 'Exam' | 'Campus' | 'Placement';
  priority: 'high' | 'medium' | 'low';
  author: string;
  publishedAt: Date;
  attachments?: string[];
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['Urgent', 'Academic', 'Exam', 'Campus', 'Placement'],
      required: true,
    },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    author: { type: String, required: true },
    publishedAt: { type: Date, default: Date.now },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
