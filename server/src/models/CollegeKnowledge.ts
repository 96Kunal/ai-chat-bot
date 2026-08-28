import mongoose, { Document, Schema } from 'mongoose';

export interface ICollegeKnowledge extends Document {
  category: 'department' | 'faculty' | 'club' | 'facility' | 'rule' | 'contact' | 'faq' | 'curriculum';
  title: string;
  tags: string[];
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const CollegeKnowledgeSchema = new Schema<ICollegeKnowledge>(
  {
    category: {
      type: String,
      enum: ['department', 'faculty', 'club', 'facility', 'rule', 'contact', 'faq', 'curriculum'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Add text index for fast search & RAG grounding
CollegeKnowledgeSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const CollegeKnowledge = mongoose.model<ICollegeKnowledge>('CollegeKnowledge', CollegeKnowledgeSchema);
