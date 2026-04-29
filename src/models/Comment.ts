import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_hidden: boolean;
  created_at: Date;
  updated_at: Date;
}

const CommentSchema: Schema = new Schema({
  post_id: { type: String, required: true },
  user_id: { type: String, required: true },
  parent_id: { type: String, default: null },
  content: { type: String, required: true },
  is_hidden: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
