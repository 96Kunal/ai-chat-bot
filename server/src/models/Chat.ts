import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  isGrounded?: boolean;
  groundingSources?: string[];
  documentContextId?: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    isGrounded: { type: Boolean, default: false },
    groundingSources: [{ type: String }],
    documentContextId: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Conversation' },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
