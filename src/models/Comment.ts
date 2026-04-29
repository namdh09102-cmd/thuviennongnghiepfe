import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  likes: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  postId: { type: String, required: true },
  parentId: { type: String, default: null },
  authorId: { type: String, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  likes: [{ type: String, default: [] }],
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
