import { Schema, model, Document } from 'mongoose';

// Interface for the Complaint Reason
export interface IComplaintReason extends Document {
  reasons: Array<{
    reason: string; // Complaint reason text
    isActive: boolean; // Whether the reason is active or not
  }>;
}

// Define the Mongoose schema
const ComplaintReasonSchema = new Schema<IComplaintReason>(
  {
    reasons: [
      {
        reason: { type: String, required: true }, // Complaint reason text
        isActive: { type: Boolean, default: true }, // Whether the reason is active
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const ComplaintReasonModel = model<IComplaintReason>('ComplaintReason', ComplaintReasonSchema);
