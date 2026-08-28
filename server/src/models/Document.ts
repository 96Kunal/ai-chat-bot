import mongoose, { Document as MDocument, Schema } from 'mongoose';

export interface IDocumentModel extends MDocument {
  userId: mongoose.Types.ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText: string;
  summary?: string;
  keyPoints?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    extractedText: { type: String, required: true },
    summary: { type: String, default: '' },
    keyPoints: [{ type: String }],
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocumentModel>('Document', DocumentSchema);
