import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  category: 'Hackathon' | 'Workshop' | 'Seminar' | 'Cultural' | 'Sports' | 'Career';
  date: Date;
  time: string;
  venue: string;
  organizer: string;
  bannerUrl?: string;
  registrationLink?: string;
  rsvpUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Hackathon', 'Workshop', 'Seminar', 'Cultural', 'Sports', 'Career'],
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    organizer: { type: String, required: true },
    bannerUrl: { type: String },
    registrationLink: { type: String },
    rsvpUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>('Event', EventSchema);
