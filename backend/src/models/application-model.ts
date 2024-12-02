import { Schema, model, Document , Types } from 'mongoose';

// Interface for the application (request) schema
export interface IApplication extends Document {
  applicationNumber: number;
  applicantName: string;
  nationalID: string;
  applicantType: 'organization' | 'individual';
  organizationName?: string | null; // Can be null
  applicationDate: Date;
  complaintReason?: Types.ObjectId | null; // Reference to ComplaintReason
  description?: string; // Description field instead of applicationCategory
  status: 'approved' | 'pending' | 'rejected';
  receivingApplication?: string | null; // Can be null
  Lawyer?: string | null;
  documents?: Array<{
    documentUrl: string; // URL of the document stored in S3
    documentDescription: string; // Description of the document
  }>; // List of related documents
}

// Define the Mongoose schema
const ApplicationSchema = new Schema<IApplication>(
  {
    applicationNumber: { type: Number, required: true, unique: true },
    applicantName: { type: String, required: true },
    nationalID: { type: String, required: true, unique: true, minlength: 11, maxlength: 11 },
    applicantType: { type: String, enum: ['organization', 'individual'], required: true },
    organizationName: { type: String, default: null }, // Default set to null
    applicationDate: { type: Date, required: true },
    complaintReason: {
        type: Schema.Types.ObjectId,
        ref: 'ComplaintReason', // Reference to the ComplaintReason model
        default: null,
      },
    description: { type: String }, // New field added for description
    status: { type: String, enum: ['approved', 'pending', 'rejected'], required: true },
    receivingApplication: { type: String, default: null }, // Default set to null
    Lawyer: { type: String , default: null },
    documents: [
        {
          documentUrl: { type: String, required: true }, // Document URL (e.g., S3 link)
          documentDescription: { type: String, required: true }, // Document description
        },
      ], // Array of documents with URLs and descriptions
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Create and export the model
export const ApplicationModel = model<IApplication>('Application', ApplicationSchema);
