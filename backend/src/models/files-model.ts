import { Schema, model, Document } from 'mongoose';

// Enum for file types
export enum FileType {
  HearingReport = 'Hearing Report', // Duruşma İzleme Raporu
  Petition = 'Petition', // Dilekçeler
  HearingMinutes = 'Hearing Minutes', // Duruşma Tutanakları
  Indictment = 'Indictment', // İddianame
}

// Interface for the File schema
export interface IFile extends Document {
  fileType: FileType; // Type of the file
  fileUrl: string; // URL of the file stored in S3
  description?: string; // Optional description of the file
}

// Define the Mongoose schema
const FileSchema = new Schema<IFile>(
  {
    fileType: {
      type: String,
      enum: Object.values(FileType), // Restrict file type to specific values
      required: true,
    },
    fileUrl: { type: String, required: true }, // File URL (e.g., S3 link)
    description: { type: String, default: null }, // Optional description
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
export const FileModel = model<IFile>('File', FileSchema);
