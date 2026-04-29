import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  author_id: string;
  category_id: string;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  tags: string[];
  published_at: Date;
  created_at: Date;
  updated_at: Date;
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  thumbnail_url: { type: String },
  author_id: { type: String },
  category_id: { type: String },
  status: { type: String, default: 'published' },
  view_count: { type: Number, default: 0 },
  like_count: { type: Number, default: 0 },
  comment_count: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false },
  is_pinned: { type: Boolean, default: false },
  tags: [{ type: String }],
  published_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
