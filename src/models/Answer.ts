import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  _id: mongoose.Types.ObjectId;
  questionId: string | mongoose.Types.ObjectId;
  authorId: string | mongoose.Types.ObjectId;
  content: string;
  upvotes: string[]; // User IDs
  isAccepted: boolean;
  isExpertAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema({
  questionId: { type: Schema.Types.Mixed, required: true },
  authorId: { type: Schema.Types.Mixed, required: true },
  content: { type: String, required: true },
  upvotes: [{ type: String }],
  isAccepted: { type: Boolean, default: false },
  isExpertAnswer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

AnswerSchema.index({ questionId: 1, createdAt: 1 });

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);
