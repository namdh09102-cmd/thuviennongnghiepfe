import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  sort_order: number;
  created_at: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sort_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
