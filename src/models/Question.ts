import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  authorId: string | mongoose.Types.ObjectId;
  tags: string[];
  status: 'open' | 'answered' | 'closed';
  viewCount: number;
  answerCount: number;
  upvotes: string[]; // User IDs
  acceptedAnswerId: string | mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.Mixed, required: true }, // Mixed to allow both ObjectId and strings
  tags: [{ type: String }],
  status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
  viewCount: { type: Number, default: 0 },
  answerCount: { type: Number, default: 0 },
  upvotes: [{ type: String }],
  acceptedAnswerId: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

QuestionSchema.index({ status: 1, createdAt: -1 });
QuestionSchema.index({ tags: 1 });

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
