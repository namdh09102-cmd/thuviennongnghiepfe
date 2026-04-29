import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
  content: string;
  user_id: string;
  is_best_answer: boolean;
  upvotes: number;
  created_at: Date;
}

export interface IQuestion extends Document {
  title: string;
  content: string;
  user_id: string;
  expert_id: string;
  status: string;
  tags: string[];
  answers: IAnswer[];
  created_at: Date;
}

const AnswerSchema = new Schema({
  content: { type: String, required: true },
  user_id: { type: String },
  is_best_answer: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

const QuestionSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user_id: { type: String },
  expert_id: { type: String },
  status: { type: String, default: 'pending' },
  tags: [{ type: String }],
  answers: [AnswerSchema],
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
