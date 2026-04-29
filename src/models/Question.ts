import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  content: string;
  user_id: string;
  expert_id: string;
  status: string;
  created_at: Date;
}

const QuestionSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user_id: { type: String },
  expert_id: { type: String },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
