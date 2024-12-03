import { Schema, model, Document } from "mongoose";
// Interface for EventCategory
export interface IEventCategory extends Document {
  name: string; // Category name
}
const EventCategorySchema = new Schema<IEventCategory>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
export const EventCategoryModel = model<IEventCategory>("EventCategory", EventCategorySchema)